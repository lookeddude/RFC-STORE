"use client";
/**
 * RFC Store — Cart Context
 *
 * Unified cart state for both guest and authenticated users.
 *
 * Guest persistence:  localStorage (key: rfc_cart_v1)
 * Auth persistence:   Supabase cart_items table (Phase 7 merge)
 *
 * Usage:
 *   const { state, addToCart, updateQuantity, removeItem, clearCart } = useCart();
 *
 * Architecture:
 *   - useReducer for predictable state transitions
 *   - useEffect hydrates from localStorage on mount (client-only)
 *   - useEffect persists to localStorage on every change
 *   - Navbar consumes state.itemCount
 *   - AddToCartBar consumes addToCart()
 *   - CartPage consumes state.items + mutators
 *
 * Phase 7 integration point:
 *   When user authenticates, call syncCartToSupabase(items, userId)
 *   which upserts localStorage items into cart_items table.
 *   On sign-out, cart stays in localStorage (items persist for guest).
 */
import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import type {
  CartItemData,
  CartState,
  CartAction,
  CartContextValue,
} from "@/types/cart";
import { CART_STORAGE_KEY } from "@/types/cart";

// ── Reducer ────────────────────────────────────────────────

function computeSummary(items: CartItemData[]): Pick<CartState, "itemCount" | "subtotal"> {
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

    case "ADD_ITEM": {
      const incoming = action.payload;
      const existing = state.items.find((i) => i.key === incoming.key);

      let items: CartItemData[];
      if (existing) {
        // Merge: increase quantity (cap at 10)
        const newQty = Math.min(existing.quantity + incoming.quantity, 10);
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
        // Remove item if quantity hits 0
        items = state.items.filter((i) => i.key !== key);
      } else {
        const clamped = Math.min(quantity, 10);
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

// ── Initial State ─────────────────────────────────────────

const initialState: CartState = {
  items: [],
  itemCount: 0,
  subtotal: 0,
  isLoading: true, // true until localStorage hydration completes
  error: null,
};

// ── Context ───────────────────────────────────────────────

const CartContext = createContext<CartContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Hydrate from localStorage on mount (client-only)
  useEffect(() => {
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
      // Corrupt storage — start fresh
      localStorage.removeItem(CART_STORAGE_KEY);
    }
    dispatch({ type: "SET_LOADING", payload: false });
  }, []);

  // Persist to localStorage whenever items change
  useEffect(() => {
    if (state.isLoading) return; // Don't persist during hydration
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
    } catch {
      // Storage full — fail silently
    }
  }, [state.items, state.isLoading]);

  // ── Actions ───────────────────────────────────────────────

  const addToCart = useCallback(
    (item: Omit<CartItemData, "key" | "lineTotal">) => {
      const key = `${item.productId}:${item.variantId ?? "null"}`;
      const lineTotal = item.unitPrice * item.quantity;
      dispatch({
        type: "ADD_ITEM",
        payload: { ...item, key, lineTotal },
      });
    },
    []
  );

  const updateQuantity = useCallback((key: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { key, quantity } });
  }, []);

  const removeItem = useCallback((key: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: { key } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" });
  }, []);

  const value: CartContextValue = {
    state,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// ── Hook ──────────────────────────────────────────────────

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
