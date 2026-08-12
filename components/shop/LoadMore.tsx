"use client";
/**
 * RFC Store — Load More Button
 *
 * Stitch design: "LOAD MORE" ghost button, centered below the product grid.
 * URL-driven: increments ?page= param.
 */
import React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import styles from "./LoadMore.module.css";

interface LoadMoreProps {
  currentPage: number;
  totalProducts: number;
  pageSize: number;
}

export function LoadMore({ currentPage, totalProducts, pageSize }: LoadMoreProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const hasMore = currentPage * pageSize < totalProducts;
  const remaining = totalProducts - currentPage * pageSize;

  if (!hasMore) return null;

  function handleLoadMore() {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(currentPage + 1));
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className={styles.wrapper}>
      <button
        onClick={handleLoadMore}
        className={styles.btn}
        aria-label={`Load more products (${remaining} remaining)`}
      >
        LOAD MORE
      </button>
      <p className={styles.count}>
        Showing {Math.min(currentPage * pageSize, totalProducts)} of {totalProducts} products
      </p>
    </div>
  );
}
