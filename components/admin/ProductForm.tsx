"use client";
/**
 * RFC Store — Admin Product Form (Phase 8)
 * Client component for create/edit product.
 * Handles: basic info, variants, image URLs.
 * Server actions: createProductAction / updateProductAction.
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { AdminProductDetail, VariantFormData, ProductFormErrors } from "@/types/admin";
import { createProductAction, updateProductAction, upsertVariantAction } from "@/lib/actions/admin/products";
import styles from "./ProductForm.module.css";

interface ProductFormProps {
  product?: AdminProductDetail;
  categories: { id: string; name: string }[];
  mode: "create" | "edit";
}

function slugify(str: string) {
  return str.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function ProductForm({ product, categories, mode }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [successMsg, setSuccessMsg] = useState("");

  // Product fields
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [shortDesc, setShortDesc] = useState(product?.short_description ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [categoryId, setCategoryId] = useState(product?.category_id ?? "");
  const [basePrice, setBasePrice] = useState(product?.base_price?.toString() ?? "");
  const [compareAt, setCompareAt] = useState(product?.compare_at_price?.toString() ?? "");
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [isFeatured, setIsFeatured] = useState(product?.is_featured ?? false);
  const [isNewArrival, setIsNewArrival] = useState(product?.is_new_arrival ?? false);
  const [isBestseller, setIsBestseller] = useState(product?.is_bestseller ?? false);
  const [tags, setTags] = useState(product?.tags?.join(", ") ?? "");
  const [metaTitle, setMetaTitle] = useState(product?.meta_title ?? "");
  const [metaDescription, setMetaDescription] = useState(product?.meta_description ?? "");

  // Variants
  const [variants, setVariants] = useState<VariantFormData[]>(
    product?.variants?.map((v) => ({
      id: v.id,
      name: v.name,
      sku: v.sku,
      price: v.price.toString(),
      compareAtPrice: v.compare_at_price?.toString() ?? "",
      attributes: JSON.stringify(v.attributes ?? {}, null, 2),
      isAvailable: v.is_available,
      stockQuantity: (v.inventory?.quantity ?? 0).toString(),
    })) ?? [defaultVariant()]
  );

  function defaultVariant(): VariantFormData {
    return { name: "", sku: "", price: "", compareAtPrice: "", attributes: "{}", isAvailable: true, stockQuantity: "0" };
  }

  const addVariant = () => setVariants((v) => [...v, defaultVariant()]);
  const removeVariant = (i: number) =>
    setVariants((v) => v.filter((_, idx) => idx !== i));
  const updateVariant = (i: number, field: keyof VariantFormData, value: string | boolean) =>
    setVariants((v) => v.map((item, idx) => idx === i ? { ...item, [field]: value } : item));

  const handleNameChange = (val: string) => {
    setName(val);
    if (!product) setSlug(slugify(val)); // auto-slug only on create
  };

  const handleSubmit = () => {
    setErrors({});
    setSuccessMsg("");
    const newErrors: ProductFormErrors = {};

    if (!name.trim()) newErrors.name = "Name is required.";
    if (!slug.trim()) newErrors.slug = "Slug is required.";
    if (!basePrice || parseFloat(basePrice) <= 0) newErrors.basePrice = "Valid price is required.";
    if (compareAt && parseFloat(compareAt) <= 0) newErrors.compareAtPrice = "Must be > 0.";

    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    const productData = {
      name: name.trim(),
      slug: slug.trim(),
      shortDescription: shortDesc,
      description,
      categoryId,
      basePrice: parseFloat(basePrice),
      compareAtPrice: compareAt ? parseFloat(compareAt) : null,
      isActive,
      isFeatured,
      isNewArrival,
      isBestseller,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      metaTitle,
      metaDescription,
    };

    const variantData = variants
      .filter((v) => v.name.trim())
      .map((v) => ({
        id: v.id,
        name: v.name,
        sku: v.sku,
        price: parseFloat(v.price) || parseFloat(basePrice),
        compareAtPrice: v.compareAtPrice ? parseFloat(v.compareAtPrice) : null,
        attributes: (() => { try { return JSON.parse(v.attributes); } catch { return {}; } })(),
        isAvailable: v.isAvailable,
        stockQuantity: parseInt(v.stockQuantity) || 0,
      }));

    startTransition(async () => {
      let result;
      if (mode === "create") {
        result = await createProductAction(productData, variantData);
      } else {
        result = await updateProductAction(product!.id, productData);
        // Update variants separately
        for (const v of variantData) {
          await upsertVariantAction(product!.id, v);
        }
      }

      if (result.success) {
        setSuccessMsg(mode === "create" ? "Product created successfully!" : "Product updated!");
        if (mode === "create" && result.id) {
          router.push(`/admin/products/${result.id}`);
        }
      } else {
        setErrors({ _form: result.error ?? "Something went wrong." });
      }
    });
  };

  return (
    <div className={styles.form}>
      {errors._form && <div className={styles.errorBanner} role="alert">{errors._form}</div>}
      {successMsg && <div className={styles.successBanner} role="status">{successMsg}</div>}

      {/* ── Basic Info ─────────────────────────────── */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Basic Information</h2>
        <div className={styles.fieldGrid}>
          <div className={styles.fieldFull}>
            <label className={styles.label} htmlFor="pf-name">Product Name *</label>
            <input id="pf-name" className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
              value={name} onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. RFC Pro Boxing Gloves"
            />
            {errors.name && <p className={styles.fieldError}>{errors.name}</p>}
          </div>
          <div>
            <label className={styles.label} htmlFor="pf-slug">URL Slug *</label>
            <input id="pf-slug" className={`${styles.input} ${errors.slug ? styles.inputError : ""}`}
              value={slug} onChange={(e) => setSlug(slugify(e.target.value))}
              placeholder="rfc-pro-boxing-gloves"
            />
            {errors.slug && <p className={styles.fieldError}>{errors.slug}</p>}
          </div>
          <div>
            <label className={styles.label} htmlFor="pf-category">Category</label>
            <select id="pf-category" className={styles.select}
              value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className={styles.fieldFull}>
            <label className={styles.label} htmlFor="pf-shortdesc">Short Description</label>
            <input id="pf-shortdesc" className={styles.input}
              value={shortDesc} onChange={(e) => setShortDesc(e.target.value)}
              placeholder="Brief product summary (shown on product cards)"
            />
          </div>
          <div className={styles.fieldFull}>
            <label className={styles.label} htmlFor="pf-desc">Full Description</label>
            <textarea id="pf-desc" className={`${styles.input} ${styles.textarea}`}
              value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed product description…"
              rows={5}
            />
          </div>
        </div>
      </div>

      {/* ── Pricing ───────────────────────────────── */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Pricing</h2>
        <div className={styles.fieldGrid}>
          <div>
            <label className={styles.label} htmlFor="pf-price">Base Price (₹) *</label>
            <input id="pf-price" type="number" min="0" step="0.01"
              className={`${styles.input} ${errors.basePrice ? styles.inputError : ""}`}
              value={basePrice} onChange={(e) => setBasePrice(e.target.value)}
              placeholder="999"
            />
            {errors.basePrice && <p className={styles.fieldError}>{errors.basePrice}</p>}
          </div>
          <div>
            <label className={styles.label} htmlFor="pf-compare">Compare At Price (₹)</label>
            <input id="pf-compare" type="number" min="0" step="0.01"
              className={`${styles.input} ${errors.compareAtPrice ? styles.inputError : ""}`}
              value={compareAt} onChange={(e) => setCompareAt(e.target.value)}
              placeholder="1299"
            />
            {errors.compareAtPrice && <p className={styles.fieldError}>{errors.compareAtPrice}</p>}
          </div>
        </div>
      </div>

      {/* ── Status & Badges ───────────────────────── */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Status & Badges</h2>
        <div className={styles.toggleGrid}>
          <ToggleField id="pf-active" label="Active (visible in store)" checked={isActive} onChange={setIsActive} />
          <ToggleField id="pf-featured" label="Featured Product" checked={isFeatured} onChange={setIsFeatured} />
          <ToggleField id="pf-new" label="New Arrival" checked={isNewArrival} onChange={setIsNewArrival} />
          <ToggleField id="pf-best" label="Bestseller" checked={isBestseller} onChange={setIsBestseller} />
        </div>
        <div style={{ marginTop: 16 }}>
          <label className={styles.label} htmlFor="pf-tags">Tags (comma-separated)</label>
          <input id="pf-tags" className={styles.input}
            value={tags} onChange={(e) => setTags(e.target.value)}
            placeholder="boxing, gloves, leather"
          />
        </div>
      </div>

      {/* ── Variants ──────────────────────────────── */}
      <div className={styles.card}>
        <div className={styles.cardHeaderRow}>
          <h2 className={styles.cardTitle}>Variants & Inventory</h2>
          <button type="button" className={styles.addVariantBtn} onClick={addVariant}>
            + Add Variant
          </button>
        </div>
        <p className={styles.cardHint}>
          Each variant has its own SKU, price, and stock quantity. Use attributes for Size, Color, etc.
        </p>
        <div className={styles.variantList}>
          {variants.map((v, i) => (
            <VariantRow key={i} variant={v} index={i}
              onChange={updateVariant}
              onRemove={variants.length > 1 ? () => removeVariant(i) : undefined}
            />
          ))}
        </div>
      </div>

      {/* ── SEO ───────────────────────────────────── */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>SEO (Optional)</h2>
        <div className={styles.fieldGrid}>
          <div className={styles.fieldFull}>
            <label className={styles.label} htmlFor="pf-metatitle">Meta Title</label>
            <input id="pf-metatitle" className={styles.input}
              value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="Defaults to product name"
            />
          </div>
          <div className={styles.fieldFull}>
            <label className={styles.label} htmlFor="pf-metadesc">Meta Description</label>
            <textarea id="pf-metadesc" className={`${styles.input} ${styles.textarea}`}
              value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="150-160 character description for search engines"
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* ── Save ──────────────────────────────────── */}
      <div className={styles.formFooter}>
        <button
          type="button"
          className={styles.saveBtn}
          onClick={handleSubmit}
          disabled={isPending}
          aria-busy={isPending}
        >
          {isPending ? "Saving…" : mode === "create" ? "Create Product" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

// ── Toggle Field ──────────────────────────────────────────
function ToggleField({ id, label, checked, onChange }: {
  id: string; label: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <label htmlFor={id} className={styles.toggleField}>
      <input id={id} type="checkbox" className={styles.toggleCheckbox}
        checked={checked} onChange={(e) => onChange(e.target.checked)}
      />
      <span className={`${styles.toggleTrack} ${checked ? styles.trackOn : styles.trackOff}`}>
        <span className={`${styles.toggleThumb} ${checked ? styles.thumbOn : styles.thumbOff}`} />
      </span>
      <span className={styles.toggleLabel}>{label}</span>
    </label>
  );
}

// ── Variant Row ───────────────────────────────────────────
function VariantRow({ variant, index, onChange, onRemove }: {
  variant: VariantFormData;
  index: number;
  onChange: (i: number, field: keyof VariantFormData, value: string | boolean) => void;
  onRemove?: () => void;
}) {
  return (
    <div className={styles.variantCard}>
      <div className={styles.variantHeader}>
        <span className={styles.variantNum}>Variant {index + 1}</span>
        {onRemove && (
          <button type="button" onClick={onRemove} className={styles.removeBtn}
            aria-label="Remove variant">
            ✕
          </button>
        )}
      </div>
      <div className={styles.fieldGrid}>
        <div>
          <label className={styles.label}>Variant Name *</label>
          <input className={styles.input} value={variant.name}
            onChange={(e) => onChange(index, "name", e.target.value)}
            placeholder="e.g. Small / 8oz / Red"
          />
        </div>
        <div>
          <label className={styles.label}>SKU *</label>
          <input className={styles.input} value={variant.sku}
            onChange={(e) => onChange(index, "sku", e.target.value)}
            placeholder="e.g. RFC-GLOVE-8OZ"
          />
        </div>
        <div>
          <label className={styles.label}>Price (₹)</label>
          <input className={styles.input} type="number" min="0" value={variant.price}
            onChange={(e) => onChange(index, "price", e.target.value)}
            placeholder="Override base price"
          />
        </div>
        <div>
          <label className={styles.label}>Stock Qty</label>
          <input className={styles.input} type="number" min="0" value={variant.stockQuantity}
            onChange={(e) => onChange(index, "stockQuantity", e.target.value)}
          />
        </div>
        <div className={styles.fieldFull}>
          <label className={styles.label}>
            Attributes (JSON) — e.g. {`{"size":"M","color":"Red"}`}
          </label>
          <textarea className={`${styles.input} ${styles.textarea}`}
            value={variant.attributes}
            onChange={(e) => onChange(index, "attributes", e.target.value)}
            rows={2}
          />
        </div>
        <div>
          <ToggleField id={`v-available-${index}`} label="Available for purchase"
            checked={variant.isAvailable}
            onChange={(v) => onChange(index, "isAvailable", v)}
          />
        </div>
      </div>
    </div>
  );
}
