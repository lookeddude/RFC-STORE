"use client";
/**
 * RFC Store — Empty Wishlist State
 */
import React from "react";
import Link from "next/link";
import styles from "./WishlistPageClient.module.css";

export function EmptyWishlist() {
  return (
    <div className={styles.empty}>
      <div className={styles.emptyIcon} aria-hidden="true">
        <HeartOutlineIcon />
      </div>
      <h2 className={styles.emptyTitle}>Your wishlist is empty</h2>
      <p className={styles.emptyText}>
        Save the gear you love. Click the heart icon on any product to add it here.
      </p>
      <Link href="/shop" className={styles.emptyBtn}>
        EXPLORE GEAR
      </Link>
    </div>
  );
}

function HeartOutlineIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
