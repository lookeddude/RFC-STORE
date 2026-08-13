'use client';
import { useState } from 'react';
import styles from './ConfirmDialog.module.css';

interface ConfirmDialogProps {
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void | Promise<void>;
  trigger: (open: () => void) => React.ReactNode;
  isDanger?: boolean;
}

export function ConfirmDialog({
  title, description, confirmLabel = 'Confirm', onConfirm, trigger, isDanger = false
}: ConfirmDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleConfirm = async () => {
    setIsPending(true);
    try { await onConfirm(); }
    finally { setIsPending(false); setIsOpen(false); }
  };

  return (
    <>
      {trigger(() => setIsOpen(true))}
      {isOpen && (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="dialog-title">
          <div className={styles.dialog}>
            <h2 id="dialog-title" className={styles.title}>{title}</h2>
            <p className={styles.desc}>{description}</p>
            <div className={styles.actions}>
              <button className={styles.cancelBtn} onClick={() => setIsOpen(false)} disabled={isPending}>
                Cancel
              </button>
              <button
                className={`${styles.confirmBtn} ${isDanger ? styles.danger : ''}`}
                onClick={handleConfirm}
                disabled={isPending}
                aria-busy={isPending}
              >
                {isPending ? 'Processing...' : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
