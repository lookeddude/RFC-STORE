/**
 * RFC Store — My Addresses Page (Phase 7)
 * Lists all saved addresses for the authenticated user.
 */
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AccountShell } from "@/components/account/AccountShell";
import { AddressCard } from "@/components/account/AddressCard";
import type { AddressRow } from "@/types/account";
import styles from "./addresses.module.css";

export const metadata: Metadata = {
  title: "My Addresses — REVIVE FIGHT CLUB",
  robots: { index: false, follow: false },
};

export default async function AddressesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/account/addresses");

  const { data: addresses } = await supabase
    .from("addresses")
    .select("id, user_id, label, full_name, phone, line1, line2, city, state, postal_code, country, is_default, created_at, updated_at")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: true });

  const list = (addresses ?? []) as AddressRow[];

  return (
    <AccountShell pageTitle="My Addresses">
      <div className={styles.page}>
        <div className={styles.topRow}>
          <p className={styles.count}>
            {list.length} {list.length === 1 ? "address" : "addresses"} saved
          </p>
          <Link href="/account/addresses/new" className={styles.addBtn}>
            + Add Address
          </Link>
        </div>

        {list.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyHeading}>No saved addresses.</p>
            <p className={styles.emptyText}>
              Add a shipping address to speed up checkout.
            </p>
            <Link href="/account/addresses/new" className={styles.addBtnLarge}>
              Add Your First Address
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {list.map((addr) => (
              <AddressCard key={addr.id} address={addr} />
            ))}
          </div>
        )}
      </div>
    </AccountShell>
  );
}
