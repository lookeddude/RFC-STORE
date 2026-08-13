/**
 * RFC Store — Admin Customers List (Phase 8)
 */
import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import styles from "@/components/admin/admin-page.module.css";

export const metadata: Metadata = {
  title: "Customers — Admin RFC Store",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 20;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const page = Math.max(1, parseInt(sp.page ?? "1") || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();

  let query = supabase
    .from("profiles")
    .select("id, email, full_name, phone, role, created_at", { count: "exact" })
    .eq("role", "customer")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (q) {
    query = query.or(`email.ilike.%${q}%,full_name.ilike.%${q}%`);
  }

  const { data: customers, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <div>
      <div className={styles.pageHeader}>
        <div className={styles.pageTitleBlock}>
          <h1 className={styles.pageTitle}>Customers</h1>
          <p className={styles.pageSub}>{count ?? 0} registered customers</p>
        </div>
      </div>

      <form method="GET" className={styles.filtersBar}>
        <input
          className={styles.searchInput}
          name="q"
          defaultValue={q}
          placeholder="Search by name or email…"
          aria-label="Search customers"
        />
        <button type="submit" className={styles.primaryBtn}>Search</button>
        {q && (
          <Link href="/admin/customers" style={{ fontSize: 13, color: "#6b7280", textDecoration: "none", padding: "9px 0" }}>Clear</Link>
        )}
      </form>

      {!customers || customers.length === 0 ? (
        <AdminEmptyState
          title="No customers found"
          description={q ? `No customers matching "${q}"` : "Registered customers will appear here."}
          icon={<EmptyIcon />}
        />
      ) : (
        <>
          <div className={styles.tableContainer}>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Joined</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.id}>
                      <td className={styles.bold}>{c.full_name ?? "—"}</td>
                      <td className={styles.muted}>{c.email}</td>
                      <td className={styles.muted}>{c.phone ?? "—"}</td>
                      <td className={styles.noWrap}>{formatDate(c.created_at)}</td>
                      <td>
                        <Link href={`/admin/customers/${c.id}`} className={styles.editBtn}>View</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <AdminPagination page={page} totalPages={totalPages} basePath="/admin/customers" searchParams={sp} />
        </>
      )}
    </div>
  );
}

function EmptyIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
    </svg>
  );
}
