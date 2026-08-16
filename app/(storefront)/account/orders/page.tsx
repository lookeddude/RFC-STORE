/**
 * RFC Store — My Orders Page (Phase 7)
 *
 * Server-side paginated order list.
 * - 10 orders per page, ordered by created_at DESC
 * - Selects only columns needed for the list (no order_items join)
 * - RLS enforces user isolation: only own orders returned
 * - item_count fetched via a separate count subquery
 */
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AccountShell } from "@/components/account/AccountShell";
import { OrderCard } from "@/components/account/OrderCard";
import type { OrderListItem } from "@/types/account";
import { ROUTES } from "@/lib/constants/site";
import styles from "./orders.module.css";

export const metadata: Metadata = {
  title: "My Orders — REVIVE FIGHT CLUB",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 10;

interface MyOrdersPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function MyOrdersPage({ searchParams }: MyOrdersPageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/account/orders");

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // Fetch order list — minimal columns
  const { data: orders, count } = await supabase
    .from("orders")
    .select("id, order_number, status, payment_status, total_amount, currency, created_at", {
      count: "exact",
    })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(from, to);

  // Fetch item counts for this page of orders
  const orderIds = (orders ?? []).map((o: { id: string }) => o.id);
  const itemCounts: Record<string, number> = {};

  if (orderIds.length > 0) {
    const { data: itemRows } = await supabase
      .from("order_items")
      .select("order_id, quantity")
      .in("order_id", orderIds);

    for (const row of itemRows ?? []) {
      const r = row as { order_id: string; quantity: number };
      itemCounts[r.order_id] = (itemCounts[r.order_id] ?? 0) + r.quantity;
    }
  }

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);
  const orderItems: OrderListItem[] = (orders ?? []).map((o: {
    id: string; order_number: string; status: string;
    payment_status: string; total_amount: number; currency: string; created_at: string;
  }) => ({
    ...o,
    item_count: itemCounts[o.id] ?? 0,
  }));

  return (
    <AccountShell pageTitle="My Orders">
      <div className={styles.page}>
        {orderItems.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyHeading}>No orders yet.</p>
            <p className={styles.emptyText}>
              When you place an order, it will appear here.
            </p>
            <Link href={ROUTES.shop} className={styles.shopBtn}>
              Browse the Shop →
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.list}>
              {orderItems.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className={styles.pagination} aria-label="Orders pagination">
                {page > 1 && (
                  <Link
                    href={`${ROUTES.account.orders}?page=${page - 1}`}
                    className={styles.pageBtn}
                  >
                    ← Previous
                  </Link>
                )}
                <span className={styles.pageInfo}>
                  Page {page} of {totalPages}
                </span>
                {page < totalPages && (
                  <Link
                    href={`${ROUTES.account.orders}?page=${page + 1}`}
                    className={styles.pageBtn}
                  >
                    Next →
                  </Link>
                )}
              </nav>
            )}
          </>
        )}
      </div>
    </AccountShell>
  );
}
