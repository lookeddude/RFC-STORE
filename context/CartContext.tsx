"use client";
/**
 * RFC Store — Cart Context (Phase 2 upgrade)
 *
 * Unified cart state for guest and authenticated users.
 *
 * GUEST mode:
 *   Write target: localStorage (key: rfc_cart_v1)
 *   Read target:  localStorage on mount
 *
 * AUTHENTICATED mode:
 *   Write target: Supabase cart_items table (via server actions)
 *   Read target:  Supabase cart_items on login + cart page mount
 *   localStorage: cleared after merge, not consulted
 *
 * AUTH TRANSITION:
 *   SIGNED_IN  → read guest localStorage → clear it → merge into DB
 *              → hydrate context from merged DB cart
 *   SIGNED_OUT → clearCart() → clear localStorage
 *
 * RACE SAFETY (merge):
 *   1. localStorage cleared synchronously BEFORE server action is awaited
 *   2. isMergingRef prevents same-tab double-fire
 *   3. merge_guest_cart RPC uses pg_advisory_xact_lock to serialize
 *      concurrent calls for the same user_id
 *
 * PRICE TRUST:
 *   addToCartAction always fetches authoritative price from DB.
 *   The unit_price stored in localStorage/cart_items is DISPLAY ONLY.
 *   placeOrderAction re-validates all prices independently.
 *
 * COD CHECKOUT:
 *   clearCart() is auth-aware: when authenticated, it also calls
 *   clearCartAction() to delete DB rows. CheckoutPageClient.tsx is UNCHANGED.
 */
import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useRef,
  useState,
} from "react";
import { createBrowserClient } from "@supabase/ssr";
import type {
  CartItemData,
  CartState,
  CartAction,
  CartContextValue,
} from "@/types/cart";
import { CART_STORAGE_KEY } from "@/types/cart";
import {
  removeCartItemAction,
  clearCartAction,
  getCartAction,
  mergeCartOnLoginAction,
} from "@/lib/actions/cart";

// ── Reducer ─────────────────────────────────────────────────

function computeSummary(
  items: CartItemData[]
): Pick<CartState, "itemCount" | "subtotal"> {
  return {
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
    subtotal: items.reduce((sum, i) => sum + i.lineTotal, 0),
  };
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "HYDRATE": {
      const items = action.payload;
      return {
        ...state,
        items,
        ...computeSummary(items),
        isLoading: false,
      };
    }

    case "SYNC_COMPLETE": {
      // Authoritative DB copy — replaces entire cart state
      const items = action.payload;
      return {
        ...state,
        items,
        ...computeSummary(items),
        isLoading: false,
        error: null,
      };
    }

    case "ADD_ITEM": {
      const incoming = action.payload;
      const existing = state.items.find((i) => i.key === incoming.key);

      let items: CartItemData[];
      if (existing) {
        const newQty = Math.min(existing.quantity + incoming.quantity, 20);
        items = state.items.map((i) =>
          i.key === incoming.key
            ? { ...i, quantity: newQty, lineTotal: i.unitPrice * newQty }
            : i
        );
      } else {
        items = [...state.items, incoming];
      }

      return { ...state, items, ...computeSummary(items), error: null };
    }

    case "UPDATE_QUANTITY": {
      const { key, quantity } = action.payload;
      let items: CartItemData[];

      if (quantity <= 0) {
        items = state.items.filter((i) => i.key !== key);
      } else {
        const clamped = Math.min(quantity, 20);
        items = state.items.map((i) =>
          i.key === key
            ? { ...i, quantity: clamped, lineTotal: i.unitPrice * clamped }
            : i
        );
      }

      return { ...state, items, ...computeSummary(items), error: null };
    }

    case "REMOVE_ITEM": {
      const items = state.items.filter((i) => i.key !== action.payload.key);
      return { ...state, items, ...computeSummary(items), error: null };
    }

    case "CLEAR_CART": {
      return {
        ...state,
        items: [],
        itemCount: 0,
        subtotal: 0,
        error: null,
      };
    }

    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false };

    default:
      return state;
  }
}

// ── Initial State ────────────────────────────────────────────

const initialState: CartState = {
  items: [],
  itemCount: 0,
  subtotal: 0,
  isLoading: true,
  error: null,
};

// ── Context ──────────────────────────────────────────────────

const CartContext = createContext<CartContextValue | null>(null);

// ── Provider ─────────────────────────────────────────────────

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Race-safety: prevent same-tab double-merge
  const isMergingRef = useRef(false);

  // ── Supabase browser client (for auth listener only) ───────
  // We use process.env here (public vars, safe in client component)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // ── Phase 2: Auth state listener ───────────────────────────
  useEffect(() => {
    if (!supabaseUrl || !supabaseAnonKey) return;

    const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setIsAuthenticated(true);

        // Prevent same-tab double-merge
        if (isMergingRef.current) return;
        isMergingRef.current = true;

        try {
          // LAYER 1: Read guest items THEN immediately clear localStorage
          // (synchronous clear before any await — eliminates cross-tab race)
          let guestItems: CartItemData[] = [];
          try {
            const raw = localStorage.getItem(CART_STORAGE_KEY);
            if (raw) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) guestItems = parsed;
            }
          } catch {
            // corrupt localStorage — treat as empty
          }

          // Clear immediately (synchronous) before the async server call
          localStorage.removeItem(CART_STORAGE_KEY);

          // LAYER 2: Server-side advisory lock handles concurrent cross-tab merges
          dispatch({ type: "SET_LOADING", payload: true });
          const result = await mergeCartOnLoginAction(guestItems);

          if (result.success && result.items) {
            dispatch({ type: "SYNC_COMPLETE", payload: result.items });
          } else {
            dispatch({ type: "SET_LOADING", payload: false });
          }
        } finally {
          isMergingRef.current = false;
        }
      } else if (event === "SIGNED_OUT") {
        setIsAuthenticated(false);
        dispatch({ type: "CLEAR_CART" });
        try {
          localStorage.removeItem(CART_STORAGE_KEY);
        } catch {
          // ignore
        }
      } else if (event === "INITIAL_SESSION") {
        // On page load, check if user is already logged in
        if (session?.user) {
          setIsAuthenticated(true);
          // Load DB cart (no guest items to merge on initial session)
          if (!isMergingRef.current) {
            isMergingRef.current = true;
            try {
              dispatch({ type: "SET_LOADING", payload: true });
              const result = await getCartAction();
              if (result.success && result.items) {
                dispatch({ type: "SYNC_COMPLETE", payload: result.items });
              } else {
                dispatch({ type: "SET_LOADING", payload: false });
              }
            } finally {
              isMergingRef.current = false;
            }
          }
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [supabaseUrl, supabaseAnonKey]);

  // ── Guest: Hydrate from localStorage on mount ───────────────
  // Only runs when NOT authenticated (INITIAL_SESSION without user).
  // When authenticated, INITIAL_SESSION handler loads from DB instead.
  useEffect(() => {
    // Don't hydrate from localStorage if auth listener already ran
    // (isLoading will be false from SYNC_COMPLETE or SET_LOADING:false)
    // We only hydrate from localStorage if state is still in initial loading state
    // and we don't have items yet. The timeout ensures the auth listener
    // has had a chance to fire first.
    const timer = setTimeout(() => {
      if (!isAuthenticated && state.isLoading) {
        try {
          const raw = localStorage.getItem(CART_STORAGE_KEY);
          if (raw) {
            const parsed: CartItemData[] = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              dispatch({ type: "HYDRATE", payload: parsed });
              return;
            }
          }
        } catch {
          localStorage.removeItem(CART_STORAGE_KEY);
        }
        dispatch({ type: "SET_LOADING", payload: false });
      }
    }, 100); // 100ms: enough for auth listener's INITIAL_SESSION to fire

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount only

  // ── Guest: Persist to localStorage on items change ──────────
  useEffect(() => {
    if (state.isLoading || isAuthenticated) return; // auth users use DB
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
    } catch {
      // Storage full — fail silently
    }
  }, [state.items, state.isLoading, isAuthenticated]);

  // ── Actions ──────────────────────────────────────────────────

  const addToCart = useCallback(
    (item: Omit<CartItemData, "key" | "lineTotal">) => {
      const key = `${item.productId}:${item.variantId ?? "null"}`;
      const lineTotal = item.unitPrice * item.quantity;
      dispatch({
        type: "ADD_ITEM",
        payload: { ...item, key, lineTotal },
      });
      // Note: addToCartAction already upserted to DB for auth users.
      // The dispatch here is the optimistic client-side update.
    },
    []
  );

  const updateQuantity = useCallback(
    (key: string, quantity: number) => {
      dispatch({ type: "UPDATE_QUANTITY", payload: { key, quantity } });

      // For auth users: persist to DB
      if (isAuthenticated) {
        // Parse key to get productId:variantId
        const separatorIdx = key.indexOf(":");
        const productId = key.substring(0, separatorIdx);
        const variantIdRaw = key.substring(separatorIdx + 1);
        const variantId = variantIdRaw === "null" ? null : variantIdRaw;

        if (quantity <= 0) {
          void removeCartItemAction(productId, variantId);
        } else {
          // Update DB (fire-and-forget; optimistic update already dispatched)
          // Import inline to avoid circular — updateCartItemAction is called directly
          import("@/lib/actions/cart").then(({ updateCartItemAction }) => {
            void updateCartItemAction(productId, variantId, quantity);
          });
        }
      }
    },
    [isAuthenticated]
  );

  const removeItem = useCallback(
    (key: string) => {
      dispatch({ type: "REMOVE_ITEM", payload: { key } });

      if (isAuthenticated) {
        const separatorIdx = key.indexOf(":");
        const productId = key.substring(0, separatorIdx);
        const variantIdRaw = key.substring(separatorIdx + 1);
        const variantId = variantIdRaw === "null" ? null : variantIdRaw;
        void removeCartItemAction(productId, variantId);
      }
    },
    [isAuthenticated]
  );

  /**
   * clearCart — auth-aware.
   * Guests: clears localStorage.
   * Auth users: clears localStorage + calls clearCartAction() to delete DB rows.
   * Called by CheckoutPageClient on successful order (no changes needed there).
   */
  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" });
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch {
      // ignore
    }
    if (isAuthenticated) {
      void clearCartAction();
    }
  }, [isAuthenticated]);

  /**
   * syncFromDb — re-fetch cart from DB and hydrate.
   * Called by CartPageClient on mount for cross-device sync.
   */
  const syncFromDb = useCallback(async () => {
    if (!isAuthenticated) return;
    dispatch({ type: "SET_LOADING", payload: true });
    const result = await getCartAction();
    if (result.success && result.items) {
      dispatch({ type: "SYNC_COMPLETE", payload: result.items });
    } else {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [isAuthenticated]);

  const value: CartContextValue = {
    state,
    isAuthenticated,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    syncFromDb,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// ── Hook ──────────────────────────────────────────────────────

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error(
      "[RFC Store] useCart() must be used inside <CartProvider>. " +
        "Ensure CartProvider wraps your app in layout.tsx."
    );
  }
  return ctx;
}
