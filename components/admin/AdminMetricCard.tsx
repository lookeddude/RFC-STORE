import styles from './AdminMetricCard.module.css';

interface AdminMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  accent?: 'red' | 'green' | 'blue' | 'yellow' | 'default';
}

export function AdminMetricCard({ title, value, subtitle, icon, accent = 'default' }: AdminMetricCardProps) {
  return (
    <div className={`${styles.card} ${styles[accent]}`}>
      <div className={styles.iconWrap}>{icon}</div>
      <div className={styles.body}>
        <p className={styles.title}>{title}</p>
        <p className={styles.value}>{value}</p>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
    </div>
  );
}
