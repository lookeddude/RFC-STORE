import Link from 'next/link';
import styles from './AdminPagination.module.css';

interface AdminPaginationProps {
  page: number;
  totalPages: number;
  basePath: string;   // e.g. '/admin/products'
  searchParams?: Record<string, string>; // preserve existing search params
}

function buildUrl(basePath: string, params: Record<string, string>, page: number) {
  const sp = new URLSearchParams({ ...params, page: String(page) });
  return `${basePath}?${sp.toString()}`;
}

export function AdminPagination({ page, totalPages, basePath, searchParams = {} }: AdminPaginationProps) {
  if (totalPages <= 1) return null;
  const { page: _p, ...rest } = searchParams;
  void _p;
  return (
    <nav className={styles.nav} aria-label="Pagination">
      {page > 1 ? (
        <Link href={buildUrl(basePath, rest, page - 1)} className={styles.btn}>
          ← Previous
        </Link>
      ) : (
        <span className={`${styles.btn} ${styles.disabled}`}>← Previous</span>
      )}
      <span className={styles.info}>Page {page} of {totalPages}</span>
      {page < totalPages ? (
        <Link href={buildUrl(basePath, rest, page + 1)} className={styles.btn}>
          Next →
        </Link>
      ) : (
        <span className={`${styles.btn} ${styles.disabled}`}>Next →</span>
      )}
    </nav>
  );
}
