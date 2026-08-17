import Link from "next/link";
import type { OrderListItem } from "@/types/account";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/types/account";
import styles from "./OrderCard.module.css";
import { cn } from "@/lib/utils/cn";

interface OrderCardProps {
  order: OrderListItem;
}

function formatPrice(amount: number | string, currency: string = "INR") {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function OrderCard({ order }: OrderCardProps) {
  const statusLabel = ORDER_STATUS_LABELS[order.status] ?? order.status;
  const paymentLabel = PAYMENT_STATUS_LABELS[order.payment_status] ?? order.payment_status;
  const href = `/account/orders/${order.order_number}`;

  return (
    <Link href={href} className={styles.card} aria-label={`View order ${order.order_number}`}>
      {/* Top: order number + badges */}
      <div className={styles.topRow}>
        <div>
          <p className={styles.orderNumber}>{order.order_number}</p>
          <p className={styles.orderDate}>{formatDate(order.created_at)}</p>
        </div>
        <div className={styles.badges}>
          <span className={cn(styles.badge, styles[`badge--${order.status}`])}>
            {statusLabel}
          </span>
          <span className={cn(styles.badge, styles.paymentBadge, styles[`paymentBadge--${order.payment_status}`])}>
            {paymentLabel}
          </span>
        </div>
      </div>

      {/* Bottom: item count + total + view link */}
      <div className={styles.metaRow}>
        <span className={styles.meta}>
          {order.item_count} {order.item_count === 1 ? "item" : "items"}
        </span>
        <span className={styles.total}>
          {formatPrice(order.total_amount, order.currency)}
        </span>
        <span className={styles.viewLink}>
          <span>View Details</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ marginLeft: 4 }}>
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
