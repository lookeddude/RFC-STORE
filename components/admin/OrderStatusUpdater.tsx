"use client";
/**
 * RFC Store — Order Status Updater (Phase 8)
 * Client component for updating order status with transition validation.
 */
import { useState, useTransition } from "react";
import { updateOrderStatusAction } from "@/lib/actions/admin/orders";
import { ORDER_STATUS_TRANSITIONS, ORDER_STATUS_LABELS, type AdminOrderStatus } from "@/types/admin";
import updaterStyles from "./updater.module.css";

interface OrderStatusUpdaterProps {
  orderId: string;
  currentStatus: string;
}

export function OrderStatusUpdater({ orderId, currentStatus }: OrderStatusUpdaterProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const allowedTransitions = ORDER_STATUS_TRANSITIONS[currentStatus as AdminOrderStatus] ?? [];

  const handleUpdate = () => {
    if (selectedStatus === currentStatus) return;
    setError(null);
    setSuccessMsg(null);
    startTransition(async () => {
      const result = await updateOrderStatusAction(orderId, selectedStatus as AdminOrderStatus);
      if (result.success) {
        setSuccessMsg(`Status updated to "${ORDER_STATUS_LABELS[selectedStatus]}".`);
      } else {
        setError(result.error ?? "Update failed.");
        setSelectedStatus(currentStatus);
      }
    });
  };

  return (
    <div className={updaterStyles.wrap}>
      <div className={updaterStyles.currentRow}>
        <span className={updaterStyles.currentLabel}>Current:</span>
        <span className={updaterStyles.currentStatus}>
          {ORDER_STATUS_LABELS[currentStatus] ?? currentStatus}
        </span>
      </div>

      {allowedTransitions.length > 0 ? (
        <div className={updaterStyles.updateRow}>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            disabled={isPending}
            className={updaterStyles.select}
            aria-label="New order status"
          >
            <option value={currentStatus}>{ORDER_STATUS_LABELS[currentStatus] ?? currentStatus} (current)</option>
            {allowedTransitions.map((st) => (
              <option key={st} value={st}>{ORDER_STATUS_LABELS[st] ?? st}</option>
            ))}
          </select>
          <button
            onClick={handleUpdate}
            disabled={isPending || selectedStatus === currentStatus}
            className={updaterStyles.updateBtn}
            aria-busy={isPending}
          >
            {isPending ? "Updating…" : "Update Status"}
          </button>
        </div>
      ) : (
        <p className={updaterStyles.noTransitions}>
          This order is in a terminal state — no further status changes allowed.
        </p>
      )}

      {error && <p className={updaterStyles.error} role="alert">{error}</p>}
      {successMsg && <p className={updaterStyles.success} role="status">{successMsg}</p>}
    </div>
  );
}
