import { ORDER_TIMELINE_STEPS, ORDER_STATUS_LABELS } from "@/types/account";
import styles from "./OrderTimeline.module.css";
import { cn } from "@/lib/utils/cn";

interface OrderTimelineProps {
  status: string;
}

/**
 * RFC Store — Order Status Timeline
 *
 * Shows the 5-step progression:
 * Pending → Confirmed → Processing → Shipped → Delivered
 *
 * Only marks steps as complete when the DB status has passed that point.
 * Does NOT show future states as completed.
 * For cancelled/refunded orders, shows a terminal badge instead.
 */
export function OrderTimeline({ status }: OrderTimelineProps) {
  // Terminal states — don't show linear timeline
  if (status === "cancelled" || status === "refunded") {
    return (
      <div>
        <span className={styles.cancelledBadge}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
            strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          Order {status === "refunded" ? "Refunded" : "Cancelled"}
        </span>
      </div>
    );
  }

  const currentIndex = ORDER_TIMELINE_STEPS.indexOf(
    status as (typeof ORDER_TIMELINE_STEPS)[number]
  );

  return (
    <div className={styles.timeline} role="list" aria-label="Order status timeline">
      {ORDER_TIMELINE_STEPS.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div
            key={step}
            className={cn(
              styles.step,
              isCompleted && styles.completed,
              isCurrent && styles.current
            )}
            role="listitem"
            aria-label={`${ORDER_STATUS_LABELS[step]}: ${
              isCompleted ? "completed" : isCurrent ? "current" : "upcoming"
            }`}
          >
            <div className={styles.dot}>
              {isCompleted && (
                <svg className={styles.checkIcon} viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="3" strokeLinecap="round"
                  strokeLinejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            <span className={styles.label}>{ORDER_STATUS_LABELS[step]}</span>
          </div>
        );
      })}
    </div>
  );
}
