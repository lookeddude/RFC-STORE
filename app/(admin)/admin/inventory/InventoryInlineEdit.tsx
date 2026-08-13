"use client";
/**
 * RFC Store — Inventory Inline Edit (Phase 8)
 * Client component for quick quantity + threshold update.
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateInventoryAction } from "@/lib/actions/admin/inventory";
import editStyles from "./inventoryEdit.module.css";

interface InventoryInlineEditProps {
  inventoryId: string;
  currentQty: number;
  currentThreshold: number;
}

export function InventoryInlineEdit({ inventoryId, currentQty, currentThreshold }: InventoryInlineEditProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [qty, setQty] = useState(currentQty.toString());
  const [threshold, setThreshold] = useState(currentThreshold.toString());
  const [error, setError] = useState("");

  const handleSave = () => {
    const q = parseInt(qty);
    const t = parseInt(threshold);
    if (!Number.isInteger(q) || q < 0) { setError("Invalid quantity."); return; }
    if (!Number.isInteger(t) || t < 0) { setError("Invalid threshold."); return; }
    setError("");

    startTransition(async () => {
      const result = await updateInventoryAction(inventoryId, q, t);
      if (result.success) {
        setIsOpen(false);
        router.refresh();
      } else {
        setError(result.error ?? "Update failed.");
      }
    });
  };

  if (!isOpen) {
    return (
      <button className={editStyles.editBtn} onClick={() => setIsOpen(true)}>
        Edit
      </button>
    );
  }

  return (
    <div className={editStyles.form}>
      <div className={editStyles.fields}>
        <div>
          <label className={editStyles.label}>Qty</label>
          <input
            className={editStyles.input}
            type="number"
            min="0"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            aria-label="Stock quantity"
          />
        </div>
        <div>
          <label className={editStyles.label}>Threshold</label>
          <input
            className={editStyles.input}
            type="number"
            min="0"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            aria-label="Low stock threshold"
          />
        </div>
      </div>
      {error && <p className={editStyles.error}>{error}</p>}
      <div className={editStyles.actions}>
        <button className={editStyles.saveBtn} onClick={handleSave} disabled={isPending}>
          {isPending ? "…" : "Save"}
        </button>
        <button className={editStyles.cancelBtn} onClick={() => { setIsOpen(false); setError(""); }}>
          Cancel
        </button>
      </div>
    </div>
  );
}
