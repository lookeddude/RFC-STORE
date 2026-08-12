"use client";
/**
 * RFC Store — Empty Cart State
 * Shown when cart has no items.
 * Provides clear CTA to browse the shop.
 */
import React from "react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants/site";
import styles from "./EmptyCart.module.css";

export function EmptyCart() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.icon} aria-hidden="true">
        <EmptyBagIcon />
      </div>
      <h2 className={styles.heading}>Your Cart is Empty</h2>
      <p className={styles.text}>
        Looks like you haven&apos;t added anything yet.
        Browse our collection of premium combat sports gear.
      </p>
      <Link href={ROUTES.shop} className={styles.shopBtn}>
        SHOP NOW
      </Link>
    </div>
  );
}

function EmptyBagIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "rgba(11,28,48,0.15)" }}>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}
