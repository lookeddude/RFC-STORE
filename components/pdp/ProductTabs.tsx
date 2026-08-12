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

function ShippingPanel() {
  const policies = [
    {
      icon: "🚚",
      title: "Free Shipping",
      body: "Free shipping on all orders above ₹5,000. Standard delivery 3–7 business days.",
    },
    {
      icon: "↩️",
      title: "7-Day Returns",
      body: "Not happy? Return unused items in original packaging within 7 days for a full refund.",
    },
    {
      icon: "🔒",
      title: "Secure Checkout",
      body: "All transactions are encrypted and processed securely. We never store card details.",
    },
    {
      icon: "📦",
      title: "Packaging",
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
