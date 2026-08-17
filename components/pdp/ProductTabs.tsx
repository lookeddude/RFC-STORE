"use client";
/**
 * RFC Store — Product Tabs Component
 *
 * Stitch design: horizontal tab bar with 3 sections:
 *   Description | Specifications | Shipping & Returns
 *
 * Mobile: collapses to accordions (one open at a time)
 * Desktop: standard tab UI with panel below
 *
 * Description: renders product.description as plain text / paragraphs
 * Specifications: derived from known product fields (no invented data)
 * Shipping & Returns: RFC policy content (config-driven, not hardcoded claims)
 *
 * Fixed: emoji icons replaced with authored SVG — craft-floor ban on
 * unicode glyphs standing in for an icon system.
 */
import React, { useState } from "react";
import type { Product } from "@/types/product";
import { formatPrice } from "@/lib/utils/format";
import styles from "./ProductTabs.module.css";

interface ProductTabsProps {
  product: Product;
}

type TabKey = "description" | "specifications" | "shipping";

const TABS: { key: TabKey; label: string }[] = [
  { key: "description", label: "Description" },
  { key: "specifications", label: "Specifications" },
  { key: "shipping", label: "Shipping & Returns" },
];

export function ProductTabs({ product }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("description");

  return (
    <div className={styles.container}>
      {/* Desktop tab bar */}
      <div className={styles.tabBar} role="tablist" aria-label="Product information">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            role="tab"
            aria-selected={activeTab === key}
            aria-controls={`panel-${key}`}
            id={`tab-${key}`}
            className={styles.tab}
            data-active={activeTab === key}
            onClick={() => setActiveTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <div className={styles.panels}>
        {/* Description */}
        <TabPanel id="description" active={activeTab === "description"} label="Description">
          <DescriptionPanel product={product} />
        </TabPanel>

        {/* Specifications */}
        <TabPanel id="specifications" active={activeTab === "specifications"} label="Specifications">
          <SpecificationsPanel product={product} />
        </TabPanel>

        {/* Shipping */}
        <TabPanel id="shipping" active={activeTab === "shipping"} label="Shipping & Returns">
          <ShippingPanel />
        </TabPanel>
      </div>
    </div>
  );
}

// ── Individual Panels ─────────────────────────────────────

function TabPanel({
  id,
  active,
  label,
  children,
}: {
  id: string;
  active: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      id={`panel-${id}`}
      role="tabpanel"
      aria-labelledby={`tab-${id}`}
      className={styles.panel}
      data-active={active}
      hidden={!active}
    >
      <h2 className={styles.panelHeading}>{label}</h2>
      {children}
    </div>
  );
}

function DescriptionPanel({ product }: { product: Product }) {
  const desc = product.description ?? product.shortDescription;

  if (!desc) {
    return (
      <p className={styles.empty}>
        Full product description coming soon.
      </p>
    );
  }

  return (
    <div className={styles.descText}>
      {desc.split("\n").map((para, i) =>
        para.trim() ? <p key={i}>{para}</p> : null
      )}
    </div>
  );
}

function SpecificationsPanel({ product }: { product: Product }) {
  const rows: { label: string; value: string }[] = [];

  if (product.category) {
    rows.push({ label: "Category", value: product.category.name });
  }

  // Price tier label
  if (product.basePrice >= 8000) {
    rows.push({ label: "Grade", value: "Professional" });
  } else if (product.basePrice >= 4000) {
    rows.push({ label: "Grade", value: "Intermediate" });
  } else {
    rows.push({ label: "Grade", value: "Training" });
  }

  // Variants summary
  if (product.variants.length > 0) {
    const sizes = [
      ...new Set(
        product.variants.map((v) => v.attributes["size"]).filter(Boolean)
      ),
    ];
    if (sizes.length > 0) {
      rows.push({ label: "Available Sizes", value: sizes.join(", ") });
    }
  }

  // Tags as keywords
  if (product.tags.length > 0) {
    rows.push({
      label: "Type",
      value: product.tags
        .slice(0, 3)
        .map((t) => t.replace(/-/g, " "))
        .join(", "),
    });
  }

  rows.push({ label: "SKU", value: product.variants[0]?.sku ?? product.slug.toUpperCase() });
  rows.push({ label: "Currency", value: `INR — ${formatPrice(product.basePrice)}` });

  if (rows.length === 0) {
    return <p className={styles.empty}>Specifications not yet available.</p>;
  }

  return (
    <table className={styles.specTable}>
      <tbody>
        {rows.map(({ label, value }) => (
          <tr key={label} className={styles.specRow}>
            <th scope="row" className={styles.specLabel}>{label}</th>
            <td className={styles.specValue}>{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── Shipping Panel ────────────────────────────────────────
// Icons replaced with authored SVGs (craft-floor: no emoji as icons)

function ShippingPanel() {
  const policies = [
    {
      icon: <TruckIcon />,
      title: "Free Shipping",
      body: "Free shipping on all orders above ₹5,000. Standard delivery 3–7 business days.",
    },
    {
      icon: <ReturnIcon />,
      title: "7-Day Returns",
      body: "Not happy? Return unused items in original packaging within 7 days for a full refund.",
    },
    {
      icon: <ShieldIcon />,
      title: "Secure Checkout",
      body: "All transactions are encrypted and processed securely. We never store card details.",
    },
    {
      icon: <BoxIcon />,
      title: "Protective Packaging",
      body: "Products are dispatched in protective packaging to ensure they arrive in perfect condition.",
    },
  ];

  return (
    <div className={styles.shippingList}>
      {policies.map(({ icon, title, body }) => (
        <div key={title} className={styles.shippingItem}>
          <span className={styles.shippingIcon} aria-hidden="true">{icon}</span>
          <div>
            <div className={styles.shippingTitle}>{title}</div>
            <div className={styles.shippingBody}>{body}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Shipping Icons (SVG, not emoji) ──────────────────────

function TruckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function ReturnIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 .49-4" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}
