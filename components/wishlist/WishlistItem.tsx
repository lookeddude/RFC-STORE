"use client";
/**
 * RFC Store — Individual Wishlist Item Card
 *
 * Shows: product image, name, price, availability badge,
 * "Add to Cart" CTA, "Move to Cart" action, "Remove" button.
 */
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { addToCartAction } from "@/lib/actions/cart";
import { formatPrice } from "@/lib/utils/format";
import type { WishlistItem as WishlistItemType } from "@/types/wishlist";
import styles from "./WishlistItem.module.css";

interface WishlistItemProps {
  item: WishlistItemType;
}

export function WishlistItem({ item }: WishlistItemProps) {
  const { addToCart } = useCart();
  const { removeFromWishlist } = useWishlist();
  const [isMoving, setIsMoving] = useState(false);
  const [moveError, setMoveError] = useState<string | null>(null);

  const discount = item.compareAtPrice
    ? Math.round(
        ((item.compareAtPrice - item.price) / item.compareAtPrice) * 100
      )
    : null;

  const handleRemove = async () => {
    await removeFromWishlist(item.productId);
  };

  const handleMoveToCart = async () => {
    setIsMoving(true);
    setMoveError(null);
    try {
      // Products with no variants can be added directly
      const result = await addToCartAction({
        productId: item.productId,
        variantId: null,
        quantity: 1,
      });

      if (result.success && result.item) {
        addToCart(result.item);
        await removeFromWishlist(item.productId);
      } else {
        // Product has variants — send to PDP to select
        setMoveError("Please select a size/option on the product page.");
      }
    } catch {
      setMoveError("Could not add to cart. Please try again.");
    } finally {
      setIsMoving(false);
    }
  };

  return (
    <div
      className={`${styles.card} ${!item.isAvailable ? styles.cardUnavailable : ""}`}
      role="listitem"
    >
      {/* Product Image */}
      <Link
        href={`/shop/${item.slug}`}
        className={styles.imageLink}
        aria-label={`View ${item.productName}`}
        tabIndex={-1}
      >
        <div className={styles.imageWrap}>
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.imageAlt ?? item.productName}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className={`${styles.image} ${!item.isAvailable ? styles.imageGrayscale : ""}`}
            />
          ) : (
            <div className={styles.imagePlaceholder}>
              <span>RFC</span>
            </div>
          )}

          {/* Discount badge */}
          {discount && item.isAvailable && (
            <div className={styles.discountBadge} aria-hidden="true">
              -{discount}%
            </div>
          )}

          {/* Unavailable overlay */}
          {!item.isAvailable && (
            <div className={styles.unavailableOverlay} aria-hidden="true">
              <span>UNAVAILABLE</span>
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className={styles.info}>
        <Link href={`/shop/${item.slug}`} className={styles.productName}>
          {item.productName}
        </Link>

        {/* Price */}
        <div className={styles.pricing}>
          <span className={styles.price}>{formatPrice(item.price)}</span>
          {item.compareAtPrice && (
            <span className={styles.comparePrice}>
              {formatPrice(item.compareAtPrice)}
            </span>
          )}
        </div>

        {/* Availability */}
        {item.isAvailable ? (
          <span className={styles.inStock}>In Stock</span>
        ) : (
          <span className={styles.unavailableBadge} role="status">
            Currently Unavailable
          </span>
        )}

        {/* Error from move-to-cart */}
        {moveError && (
          <p className={styles.moveError} role="alert">
            {moveError}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        {item.isAvailable ? (
          <>
            <button
              type="button"
              className={styles.moveBtn}
              onClick={handleMoveToCart}
              disabled={isMoving}
              aria-label={`Add ${item.productName} to cart`}
              aria-busy={isMoving}
            >
              {isMoving ? "ADDING…" : "ADD TO CART"}
            </button>
            <Link
              href={`/shop/${item.slug}`}
              className={styles.viewBtn}
              aria-label={`View ${item.productName} details`}
            >
              VIEW ITEM
            </Link>
          </>
        ) : (
          <Link
            href={`/shop/${item.slug}`}
            className={styles.viewBtn}
            aria-label={`View ${item.productName} details`}
          >
            VIEW ITEM
          </Link>
        )}

        <button
          type="button"
          className={styles.removeBtn}
          onClick={handleRemove}
          aria-label={`Remove ${item.productName} from wishlist`}
          title="Remove from wishlist"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}

function TrashIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}
