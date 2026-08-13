"use client";
/**
 * RFC Store — Category Actions (create + edit client component)
 * Handles inline modal forms for category create/edit.
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCategoryAction, updateCategoryAction } from "@/lib/actions/admin/categories";

import styles from "./CategoryActions.module.css";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  parent_id?: string | null;
};

interface CategoryActionsProps {
  mode: "create" | "edit";
  category?: CategoryRow;
}


function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
}

export function CategoryActions({ mode, category }: CategoryActionsProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [imageUrl, setImageUrl] = useState(category?.image_url ?? "");
  const [sortOrder, setSortOrder] = useState(category?.sort_order?.toString() ?? "0");
  const [isActive, setIsActive] = useState(category?.is_active ?? true);

  const handleOpen = () => {
    setError("");
    setName(category?.name ?? "");
    setSlug(category?.slug ?? "");
    setDescription(category?.description ?? "");
    setImageUrl(category?.image_url ?? "");
    setSortOrder(category?.sort_order?.toString() ?? "0");
    setIsActive(category?.is_active ?? true);
    setIsOpen(true);
  };

  const handleSubmit = () => {
    if (!name.trim()) { setError("Name is required."); return; }
    if (!slug.trim()) { setError("Slug is required."); return; }
    setError("");

    const data = { name, slug, description, imageUrl, sortOrder, isActive };

    startTransition(async () => {
      const result = mode === "create"
        ? await createCategoryAction(data)
        : await updateCategoryAction(category!.id, data);

      if (result.success) {
        setIsOpen(false);
        router.refresh();
      } else {
        setError(result.error ?? "Something went wrong.");
      }
    });
  };

  return (
    <>
      {mode === "create" ? (
        <button className={styles.createBtn} onClick={handleOpen}>+ Add Category</button>
      ) : (
        <button className={styles.editBtn} onClick={handleOpen}>Edit</button>
      )}

      {isOpen && (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={mode === "create" ? "Create Category" : "Edit Category"}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{mode === "create" ? "Add Category" : "Edit Category"}</h2>
              <button className={styles.closeBtn} onClick={() => setIsOpen(false)} aria-label="Close">✕</button>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.fields}>
              <div className={styles.field}>
                <label className={styles.label}>Name *</label>
                <input className={styles.input} value={name}
                  onChange={(e) => { setName(e.target.value); if (mode === "create") setSlug(slugify(e.target.value)); }}
                  placeholder="e.g. Boxing Gloves"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Slug *</label>
                <input className={styles.input} value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  placeholder="boxing-gloves"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Description</label>
                <textarea className={`${styles.input} ${styles.textarea}`} value={description}
                  onChange={(e) => setDescription(e.target.value)} rows={2}
                  placeholder="Brief category description"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Image URL</label>
                <input className={styles.input} value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://…"
                />
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>Sort Order</label>
                  <input className={styles.input} type="number" value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)} />
                </div>
                <label className={styles.toggleField}>
                  <input type="checkbox" className={styles.hiddenCheck}
                    checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                  <span className={`${styles.track} ${isActive ? styles.trackOn : styles.trackOff}`}>
                    <span className={`${styles.thumb} ${isActive ? styles.thumbOn : styles.thumbOff}`} />
                  </span>
                  <span className={styles.toggleLabel}>Active</span>
                </label>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setIsOpen(false)} disabled={isPending}>Cancel</button>
              <button className={styles.saveBtn} onClick={handleSubmit} disabled={isPending}>
                {isPending ? "Saving…" : mode === "create" ? "Create Category" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
