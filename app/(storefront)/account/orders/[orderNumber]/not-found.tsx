import Link from "next/link";
import { ROUTES } from "@/lib/constants/site";
import { AccountShell } from "@/components/account/AccountShell";

export default function OrderNotFound() {
  return (
    <AccountShell greeting="Order Not Found">
      <div style={{
        background: "var(--color-surface-container-lowest)",
        border: "1px solid var(--color-outline-variant)",
        borderRadius: "var(--radius-default)",
        padding: "64px 32px",
        textAlign: "center",
      }}>
        <p style={{
          fontFamily: "var(--font-headline)",
          fontSize: "22px",
          fontWeight: 700,
          textTransform: "uppercase",
          color: "var(--color-primary)",
          marginBottom: "12px",
        }}>
          Order Not Found
        </p>
        <p style={{
          fontSize: "15px",
          color: "var(--color-on-surface-variant)",
          marginBottom: "24px",
        }}>
          This order doesn&apos;t exist or doesn&apos;t belong to your account.
        </p>
        <Link
          href={ROUTES.account.orders}
          style={{
            display: "inline-flex",
            padding: "12px 24px",
            background: "var(--color-secondary)",
            color: "var(--color-on-secondary)",
            borderRadius: "var(--radius-sm)",
            fontFamily: "var(--font-label)",
            fontSize: "13px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            textDecoration: "none",
          }}
        >
          View My Orders
        </Link>
      </div>
    </AccountShell>
  );
}
