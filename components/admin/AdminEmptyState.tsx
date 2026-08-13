import Link from 'next/link';
import styles from './AdminEmptyState.module.css';

interface AdminEmptyStateProps {
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  icon?: React.ReactNode;
}

export function AdminEmptyState({ title, description, ctaLabel, ctaHref, icon }: AdminEmptyStateProps) {
  return (
    <div className={styles.wrap}>
      {icon && <div className={styles.icon}>{icon}</div>}
      <p className={styles.title}>{title}</p>
      {description && <p className={styles.desc}>{description}</p>}
      {ctaLabel && ctaHref && (
        <Link href={ctaHref} className={styles.cta}>{ctaLabel}</Link>
      )}
    </div>
  );
}
