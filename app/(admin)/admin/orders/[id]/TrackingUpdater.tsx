'use client';
/**
 * RFC Store - TrackingUpdater
 * Admin component to enter + save shipment tracking number and courier.
 */
import { useState, useTransition } from 'react';
import { updateTrackingAction } from '@/lib/actions/admin/orders';
import updaterStyles from './updater.module.css';

interface TrackingUpdaterProps {
  orderId: string;
  currentTrackingNumber: string | null;
  currentCourier: string | null;
}

const COURIERS = [
  'Delhivery',
  'Bluedart',
  'DTDC',
  'Ecom Express',
  'Shadowfax',
  'XpressBees',
  'India Post',
  'FedEx',
  'Other',
];

export function TrackingUpdater({
  orderId,
  currentTrackingNumber,
  currentCourier,
}: TrackingUpdaterProps) {
  const [isPending, startTransition] = useTransition();
  const [trackingNumber, setTrackingNumber] = useState(currentTrackingNumber ?? '');
  const [courier, setCourier] = useState(currentCourier ?? '');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const hasExisting = Boolean(currentTrackingNumber);

  const handleSave = () => {
    if (!trackingNumber.trim()) { setError('Tracking number is required.'); return; }
    setError(null); setSuccess(null);
    startTransition(async () => {
      const result = await updateTrackingAction(orderId, trackingNumber, courier);
      if (result.success) {
        setSuccess('Tracking info saved. Customer will be notified if order is shipped.');
      } else {
        setError(result.error ?? 'Failed to save tracking info.');
      }
    });
  };

  return (
    <div className={updaterStyles.wrap}>
      {hasExisting && (
        <div className={updaterStyles.currentRow} style={{ marginBottom: 12 }}>
          <span className={updaterStyles.currentLabel}>Current:</span>
          <span className={updaterStyles.currentStatus}>
            {currentTrackingNumber}{currentCourier ? ` (${currentCourier})` : ''}
          </span>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <input
          type='text'
          placeholder='Tracking number'
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          disabled={isPending}
          className={updaterStyles.select}
          style={{ fontFamily: 'monospace', fontSize: 12 }}
          aria-label='Tracking number'
        />
        <select
          value={courier}
          onChange={(e) => setCourier(e.target.value)}
          disabled={isPending}
          className={updaterStyles.select}
          aria-label='Courier partner'
        >
          <option value=''>-- Select courier --</option>
          {COURIERS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button
          onClick={handleSave}
          disabled={isPending || !trackingNumber.trim()}
          className={updaterStyles.updateBtn}
          aria-busy={isPending}
        >
          {isPending ? 'Saving...' : hasExisting ? 'Update Tracking' : 'Save Tracking'}
        </button>
      </div>
      {error && <p className={updaterStyles.error} role='alert'>{error}</p>}
      {success && <p className={updaterStyles.success} role='status'>{success}</p>}
    </div>
  );
}
