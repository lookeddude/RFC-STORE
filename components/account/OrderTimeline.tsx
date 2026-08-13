'use client';
import styles from './OrderTimeline.module.css';

const STEPS = [
  { key: 'pending', label: 'Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
];

const STATUS_INDEX: Record<string, number> = {
  pending: 0,
  confirmed: 1,
  processing: 2,
  shipped: 3,
  delivered: 4,
  cancelled: -1,
  refunded: -1,
};

interface OrderTimelineProps {
  status: string;
}

export function OrderTimeline({ status }: OrderTimelineProps) {
  const currentIndex = STATUS_INDEX[status] ?? 0;
  const isCancelled = status === 'cancelled' || status === 'refunded';

  if (isCancelled) {
    return (
      <div className={styles.cancelledBadge}>
        ORDER {status === 'refunded' ? 'REFUNDED' : 'CANCELLED'}
      </div>
    );
  }

  return (
    <div className={styles.timelineWrapper}>
      <div className={styles.timeline}>
        {STEPS.map((step, i) => {
          const isDone = i < currentIndex;
          const isCurrent = i === currentIndex;
          const isFuture = i > currentIndex;
          const isLast = i === STEPS.length - 1;

          return (
            <div 
              key={step.key} 
              className={`
                ${styles.step} 
                ${isDone ? styles.done : ''} 
                ${isCurrent ? styles.current : ''}
                ${isFuture ? styles.future : ''}
              `}
            >
              <div className={styles.nodeContainer}>
                <div className={styles.dot} />
                {!isLast && <div className={styles.line} />}
              </div>
              <span className={styles.label}>{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
