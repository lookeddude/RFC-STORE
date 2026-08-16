'use client';

/**
 * RFC Store — Payment Method Picker
 *
 * Radio card selector for COD vs Razorpay online payment.
 * Only shown when Razorpay is configured (NEXT_PUBLIC_RAZORPAY_KEY_ID set).
 */

import { useId } from 'react';
import styles from './PaymentMethodPicker.module.css';

export type PaymentMethodChoice = 'cod' | 'razorpay';

interface Props {
  value: PaymentMethodChoice;
  onChange: (method: PaymentMethodChoice) => void;
  codFee?: number;
  razorpayEnabled?: boolean;
}

export function PaymentMethodPicker({
  value,
  onChange,
  codFee = 0,
  razorpayEnabled = false,
}: Props) {
  const codId = useId();
  const rzpId = useId();

  if (!razorpayEnabled) {
    // If Razorpay not configured, render nothing (COD is implicit)
    return null;
  }

  return (
    <div className={styles.wrapper}>
      <p className={styles.label}>Payment Method</p>

      {/* COD option */}
      <label
        htmlFor={codId}
        className={`${styles.card} ${value === 'cod' ? styles.selected : ''}`}
      >
        <input
          id={codId}
          type="radio"
          name="paymentMethod"
          value="cod"
          checked={value === 'cod'}
          onChange={() => onChange('cod')}
          className={styles.radio}
        />
        <span className={styles.radioIndicator} aria-hidden="true" />
        <span className={styles.cardContent}>
          <span className={styles.cardTitle}>Cash on Delivery</span>
          <span className={styles.cardDesc}>
            Pay when your order arrives.{codFee > 0 ? ` ₹${codFee} handling fee applies.` : ''}
          </span>
        </span>
      </label>

      {/* Razorpay option */}
      <label
        htmlFor={rzpId}
        className={`${styles.card} ${value === 'razorpay' ? styles.selected : ''}`}
      >
        <input
          id={rzpId}
          type="radio"
          name="paymentMethod"
          value="razorpay"
          checked={value === 'razorpay'}
          onChange={() => onChange('razorpay')}
          className={styles.radio}
        />
        <span className={styles.radioIndicator} aria-hidden="true" />
        <span className={styles.cardContent}>
          <span className={styles.cardTitle}>
            Pay Online
            <span className={styles.razorpayBadge}>UPI · Card · Net Banking</span>
          </span>
          <span className={styles.cardDesc}>
            Secure payment via Razorpay · No extra fee
          </span>
        </span>
        <span className={styles.secureIcon} aria-label="Secure payment">🔒</span>
      </label>
    </div>
  );
}
