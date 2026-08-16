/**
 * RFC Store — Saved Address Picker (Phase 3)
 *
 * Shown to authenticated users at checkout.
 * Lists their saved addresses as selectable cards.
 * On selection, calls onSelect(address) which the parent uses to
 * populate the checkout form fields.
 *
 * Purely additive — does not change the form submission logic.
 * Form data always comes from user-editable form fields.
 */
"use client";
import React from 'react';
import type { AddressRow } from '@/types/account';
import styles from './SavedAddressPicker.module.css';

interface Props {
  addresses: AddressRow[];
  selectedId: string | null;
  onSelect: (address: AddressRow) => void;
}

export function SavedAddressPicker({ addresses, selectedId, onSelect }: Props) {
  if (addresses.length === 0) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.icon}>📍</span>
        <span className={styles.label}>Use a saved address</span>
      </div>
      <ul className={styles.list} role="list">
        {addresses.map((addr) => {
          const isSelected = selectedId === addr.id;
          return (
            <li key={addr.id}>
              <button
                type="button"
                className={`${styles.card} ${isSelected ? styles.selected : ''}`}
                onClick={() => onSelect(addr)}
                aria-pressed={isSelected}
                aria-label={`Use address: ${addr.full_name}, ${addr.line1}, ${addr.city}`}
              >
                <div className={styles.cardTop}>
                  <span className={styles.cardName}>{addr.full_name}</span>
                  {addr.is_default && (
                    <span className={styles.defaultBadge}>Default</span>
                  )}
                  <span className={styles.cardLabel}>{addr.label}</span>
                </div>
                <div className={styles.cardAddress}>
                  {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}
                </div>
                <div className={styles.cardCity}>
                  {addr.city}, {addr.state} – {addr.postal_code}
                </div>
                <div className={styles.cardPhone}>{addr.phone}</div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
