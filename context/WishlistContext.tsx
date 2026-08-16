"use client";
/**
 * RFC Store — Wishlist Context (Phase 2)
 *
 * Authentication-aware wishlist state.
 * Authenticated users only — no guest wishlist.
 *
 * Unauthenticated users:
 *   isAuthenticated = false
 *   isWishlisted() always returns false
 *   toggleWishlist() → does nothing (caller shows login prompt)
 *
 * Authenticated users:
 *   wishlist loaded from DB on SIGNED_IN / INITIAL_SESSION
 *   cleared on SIGNED_OUT
 *   O(1) isWishlisted(productId) via Set<string>
 *
 * CONCURRENCY SAFETY:
 *   addToWishlist    → addToWishlistAction (INSERT ON CONFLICT DO NOTHING)
 *   removeFromWishlist → removeFromWishlistAction (DELETE — idempotent)
 *   Optimistic update applied immediately; rolled back on server error.
 */
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { WishlistContextValue, WishlistItem, WishlistState } from "@/types/wishlist";
import {
  addToWishlistAction,
  removeFromWishlistAction,
  getWishlistAction,
} from "@/lib/actions/wishlist";

// ── Initial State ─────────────────────────────────────────────

const initialState: WishlistState = {
  items: [],
  productIds: new Set(),
  isLoading: false,
  error: null,
};

// ── Context ───────────────────────────────────────────────────

const WishlistContext = createContext<WishlistContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WishlistState>(initialState);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // ── Load wishlist from DB ─────────────────────────────────

  const loadWishlist = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    const result = await getWishlistAction();
    if (result.success && result.items) {
      setState({
        items: result.items,
        productIds: new Set(result.items.map((i) => i.productId)),
        isLoading: false,
        error: null,
      });
    } else {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: result.error ?? null,
      }));
    }
  }, []);

  // ── Auth state listener ───────────────────────────────────

  useEffect(() => {
    if (!supabaseUrl || !supabaseAnonKey) return;

    const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (
        (event === "SIGNED_IN" || event === "INITIAL_SESSION") &&
        session?.user
      ) {
        setIsAuthenticated(true);
        await loadWishlist();
      } else if (event === "SIGNED_OUT") {
        setIsAuthenticated(false);
        setState({ ...initialState, productIds: new Set() });
      }
    });

    return () => subscription.unsubscribe();
  }, [supabaseUrl, supabaseAnonKey, loadWishlist]);

  // ── isWishlisted ──────────────────────────────────────────

  const isWishlisted = useCallback(
    (productId: string) => state.productIds.has(productId),
    [state.productIds]
  );

  // ── addToWishlist ─────────────────────────────────────────

  const addToWishlist = useCallback(async (productId: string) => {
    // Optimistic update
    setState((prev) => {
      const newIds = new Set(prev.productIds);
      newIds.add(productId);
      return { ...prev, productIds: newIds };
    });

    const result = await addToWishlistAction(productId);

    if (!result.success) {
      // Roll back optimistic update
      setState((prev) => {
        const newIds = new Set(prev.productIds);
        newIds.delete(productId);
        return { ...prev, productIds: newIds, error: result.error ?? null };
      });
    } else {
      // Reload to get full WishlistItem data (for wishlist page)
      await loadWishlist();
    }
  }, [loadWishlist]);

  // ── removeFromWishlist ────────────────────────────────────

  const removeFromWishlist = useCallback(async (productId: string) => {
    // Optimistic update
    setState((prev) => {
      const newIds = new Set(prev.productIds);
      newIds.delete(productId);
      const newItems = prev.items.filter((i) => i.productId !== productId);
      return { ...prev, productIds: newIds, items: newItems };
    });

    const result = await removeFromWishlistAction(productId);

    if (!result.success) {
      // Roll back optimistic update — reload from DB
      await loadWishlist();
    }
  }, [loadWishlist]);

  // ── toggleWishlist ────────────────────────────────────────

  /**
   * Toggle wishlist state based on current known state.
   * Calls addToWishlist or removeFromWishlist explicitly —
   * never a read-then-write toggle on the server.
   */
  const toggleWishlist = useCallback(
    async (productId: string) => {
      if (!isAuthenticated) return; // caller shows login prompt

      if (state.productIds.has(productId)) {
        await removeFromWishlist(productId);
      } else {
        await addToWishlist(productId);
      }
    },
    [isAuthenticated, state.productIds, addToWishlist, removeFromWishlist]
  );

  const value: WishlistContextValue = {
    state,
    isAuthenticated,
    isWishlisted,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error(
      "[RFC Store] useWishlist() must be used inside <WishlistProvider>. " +
        "Ensure WishlistProvider wraps your app in layout.tsx."
    );
  }
  return ctx;
}
