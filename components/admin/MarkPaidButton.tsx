'use client';
/**
 * RFC Store - MarkPaidButton
 * Calls markCodPaidAction server action inline.
 * Shows spinner -> success/error without any page navigation.
 */
import { useState, useTransition } from 'react';
import { markCodPaidAction } from '@/lib/actions/admin/orders';

export function MarkPaidButton({ orderId }: { orderId: string }) {
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (done) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '8px 16px',
        background: '#f0fdf4', color: '#15803d',
        border: '1px solid #22c55e', borderRadius: 6,
        fontFamily: 'var(--font-label)', fontSize: 12, fontWeight: 700,
        letterSpacing: '0.05em',
      }}>
        Marked as Paid
      </span>
    );
  }

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 4 }}>
      <button
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await markCodPaidAction(orderId);
            if (result.success) {
              setDone(true);
            } else {
              setError(result.error ?? 'Failed to mark as paid.');
            }
          });
        }}
        disabled={isPending}
        aria-busy={isPending}
        style={{
          padding: '8px 16px',
          background: isPending ? '#166534' : '#15803d',
          color: '#fff', border: 'none',
          borderRadius: 6, cursor: isPending ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--font-label)',
          fontSize: 12, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.05em',
          opacity: isPending ? 0.7 : 1,
        }}
      >
        {isPending ? 'Saving...' : 'Mark as Paid (COD)'}
      </button>
      {error && <p style={{ fontSize: 12, color: '#dc2626', margin: 0 }} role='alert'>{error}</p>}
    </div>
  );
}
