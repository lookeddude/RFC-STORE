"use client";
/**
 * RFC Store — Wishlist Page Client
 *
 * Reads wishlist state from WishlistContext (loaded from DB on auth).
 * Displays grid of WishlistItem cards.
 * Unavailable items are moved to the bottom.
 */
import React from "react";
import { useWishlist } from "@/context/WishlistContext";
import { WishlistItem } from "./WishlistItem";
import { EmptyWishlist } from "./EmptyWishlist";
import styles from "./WishlistPageClient.module.css";

export function WishlistPageClient() {
  const { state } = useWishlist();

  if (state.isLoading) {
    return <WishlistSkeleton />;
  }

  if (state.items.length === 0) {
    return <EmptyWishlist />;
  }

  // Separate available and unavailable (unavailable go to bottom)
  const available = state.items.filter((i) => i.isAvailable);
  const unavailable = state.items.filter((i) => !i.isAvailable);
  const sorted = [...available, ...unavailable];

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>My Wishlist</h1>
        <span className={styles.count} aria-live="polite">
          {state.items.length} {state.items.length === 1 ? "item" : "items"}
        </span>
      </div>

      {/* Unavailable notice */}
      {unavailable.length > 0 && (
        <div className={styles.unavailableNotice} role="note">
          {unavailable.length === 1
            ? "1 item is currently unavailable."
            : `${unavailable.length} items are currently unavailable.`}{" "}
          They will be saved until they become available again.
        </div>
      )}

      {/* Items */}
      <div
        className={styles.list}
        role="list"
        aria-label="Wishlist items"
      >
        {sorted.map((item) => (
          <WishlistItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

function WishlistSkeleton() {
  return (
    <div className={styles.page}>
      <div className={styles.skeletonHeader} />
      <div className={styles.list}>
        {[1, 2, 3].map((n) => (
          <div key={n} className={styles.skeletonCard} aria-hidden="true" />
        ))}
      </div>
    </div>
  );
}
