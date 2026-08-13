// RFC Store — Admin Status Badge (pure display, no state)
// Props: status string, variant: 'order' | 'payment' | 'product' | 'stock'
import styles from './AdminBadge.module.css';
import { cn } from '@/lib/utils/cn';

interface AdminBadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary';
  size?: 'sm' | 'md';
}

export function AdminBadge({ label, variant = 'neutral', size = 'sm' }: AdminBadgeProps) {
  return (
    <span className={cn(styles.badge, styles[variant], size === 'sm' ? styles.sm : styles.md)}>
      {label}
    </span>
  );
}

export function orderStatusBadge(status: string): AdminBadgeProps {
  const map: Record<string, AdminBadgeProps> = {
    pending:    { label: 'Pending',    variant: 'warning' },
    confirmed:  { label: 'Confirmed', variant: 'info' },
    processing: { label: 'Processing', variant: 'info' },
    shipped:    { label: 'Shipped',   variant: 'primary' },
    delivered:  { label: 'Delivered', variant: 'success' },
    cancelled:  { label: 'Cancelled', variant: 'error' },
    refunded:   { label: 'Refunded',  variant: 'neutral' },
  };
  return map[status] ?? { label: status, variant: 'neutral' };
}

export function paymentStatusBadge(status: string): AdminBadgeProps {
  const map: Record<string, AdminBadgeProps> = {
    pending:  { label: 'Unpaid',   variant: 'warning' },
    paid:     { label: 'Paid',     variant: 'success' },
    failed:   { label: 'Failed',   variant: 'error' },
    refunded: { label: 'Refunded', variant: 'neutral' },
  };
  return map[status] ?? { label: status, variant: 'neutral' };
}

export function stockStatusBadge(qty: number, threshold: number): AdminBadgeProps {
  if (qty === 0) return { label: 'Out of Stock', variant: 'error' };
  if (qty <= threshold) return { label: 'Low Stock', variant: 'warning' };
  return { label: 'In Stock', variant: 'success' };
}
