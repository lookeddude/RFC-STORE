"use client";
/**
 * RFC Store — Admin Media Library Page (Phase 8)
 * Client component for drag-and-drop uploads + image grid.
 * Upload goes through /api/admin/upload (server route) — service role key never hits the browser.
 */
import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import styles from "./media.module.css";
import adminStyles from "@/components/admin/admin-page.module.css";

interface MediaItem {
  name: string;
  url: string;
  size?: number;
  created_at?: string;
}

export default function AdminMediaPage() {
  const [images, setImages] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadImages = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/media");
      if (res.ok) {
        const data = await res.json();
        setImages(data.images ?? []);
      }
    } catch {
      // Silent fail — empty state shown
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadImages(); }, [loadImages]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError("");
    setSuccessMsg("");
    setIsUploading(true);

    const results: string[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      try {
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) {
          setUploadError(data.error ?? "Upload failed.");
        } else {
          results.push(data.url);
        }
      } catch {
        setUploadError("Network error during upload.");
      }
    }

    if (results.length > 0) {
      setSuccessMsg(`${results.length} image${results.length > 1 ? "s" : ""} uploaded successfully.`);
      await loadImages();
    }
    setIsUploading(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleUpload(e.dataTransfer.files);
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(""), 2000);
    } catch { /* ignore */ }
  };

  return (
    <div>
      <div className={adminStyles.pageHeader}>
        <div className={adminStyles.pageTitleBlock}>
          <h1 className={adminStyles.pageTitle}>Media Library</h1>
          <p className={adminStyles.pageSub}>Product images stored in Supabase Storage</p>
        </div>
        <button className={adminStyles.primaryBtn}
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}>
          {isUploading ? "Uploading…" : "Upload Images"}
        </button>
      </div>

      {uploadError && <div className={styles.errorBanner}>{uploadError}</div>}
      {successMsg && <div className={styles.successBanner}>{successMsg}</div>}

      {/* Drop Zone */}
      <div
        className={`${styles.dropZone} ${isDragging ? styles.dragging : ""}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload images by clicking or dropping files"
        onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          className={styles.hiddenInput}
          onChange={(e) => handleUpload(e.target.files)}
        />
        <UploadIcon />
        <p className={styles.dropText}>
          {isUploading ? "Uploading…" : "Drop images here or click to upload"}
        </p>
        <p className={styles.dropHint}>JPEG, PNG, WebP · Max 5MB each</p>
      </div>

      {/* Image Grid */}
      {isLoading ? (
        <div className={styles.loadingGrid}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>No images uploaded yet.</p>
          <p className={styles.emptyHint}>Upload your first product image above.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {images.map((img) => (
            <div key={img.name} className={styles.imgCard}>
              <div className={styles.imgWrap}>
                <Image
                  src={img.url}
                  alt={img.name}
                  fill
                  className={styles.img}
                  unoptimized
                />
              </div>
              <div className={styles.imgInfo}>
                <p className={styles.imgName}>{img.name.split("/").pop()}</p>
                <button
                  className={`${styles.copyBtn} ${copiedUrl === img.url ? styles.copied : ""}`}
                  onClick={() => copyToClipboard(img.url)}
                  aria-label="Copy URL"
                >
                  {copiedUrl === img.url ? "✓ Copied!" : "Copy URL"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function UploadIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#9ca3af" }}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" x2="12" y1="3" y2="15"/>
    </svg>
  );
}
