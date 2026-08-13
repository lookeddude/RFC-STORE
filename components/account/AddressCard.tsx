"use client";
/**
 * RFC Store — Address Card (Phase 7)
 *
 * Renders a saved address with Edit, Delete, and Set as Default actions.
 * All mutations call server actions — ownership is enforced server-side.
 */
import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  deleteAddressAction,
  setDefaultAddressAction,
} from "@/lib/actions/addresses";
import type { AddressRow } from "@/types/account";
import styles from "./AddressCard.module.css";
import { cn } from "@/lib/utils/cn";

interface AddressCardProps {
  address: AddressRow;
}

export function AddressCard({ address }: AddressCardProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSetDefault = () => {
    if (address.is_default || isPending) return;
    setError(null);
    startTransition(async () => {
      const result = await setDefaultAddressAction(address.id);
      if (!result.success) setError(result.error ?? "Could not set default.");
      else router.refresh();
    });
  };

  const handleDelete = () => {
    if (isPending) return;
    if (!confirm(`Delete address "${address.label}"? This cannot be undone.`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteAddressAction(address.id);
      if (!result.success) setError(result.error ?? "Could not delete address.");
      else router.refresh();
    });
  };

  return (
    <div className={styles.card}>
      {/* Header: label + default badge + action buttons */}
      <div className={styles.cardHeader}>
        <div className={styles.labelRow}>
          <span className={styles.label}>{address.label}</span>
          {address.is_default && (
            <span className={styles.defaultBadge}>Default</span>
          )}
        </div>

        <div className={styles.actions}>
          {!address.is_default && (
            <button
              onClick={handleSetDefault}
              disabled={isPending}
              className={cn(styles.actionBtn, styles["actionBtn--default"])}
              aria-label={`Set ${address.label} as default address`}
            >
              Set Default
            </button>
          )}
          <Link
            href={`/account/addresses/${address.id}/edit`}
            className={styles.actionBtn}
            aria-label={`Edit ${address.label} address`}
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className={cn(styles.actionBtn, styles["actionBtn--delete"])}
            aria-label={`Delete ${address.label} address`}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Address body */}
      <address className={styles.address}>
        <span className={styles.name}>{address.full_name}</span><br />
        {address.line1}
        {address.line2 && <><br />{address.line2}</>}
        <br />
        {address.city}, {address.state} – {address.postal_code}
        <br />
        {address.country === "IN" ? "India" : address.country}
        <p className={styles.phone}>{address.phone}</p>
      </address>

      {error && <p className={styles.error} role="alert">{error}</p>}
    </div>
  );
}
