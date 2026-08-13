'use client';

/**
 * RFC Store — Admin Slide Editor Form Component
 *
 * Full structured editor with:
 * - 3 device-specific image upload zones (Desktop, Tablet, Mobile)
 * - Dimension recommendations & instantaneous preview
 * - Content, buttons, layout, overlay, animation timing settings
 * - Live real-time preview panel
 */
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { SlidePreview } from './SlidePreview';
import { createHeroSlideAction, updateHeroSlideAction } from '@/lib/actions/admin/hero-slides';
import type { HeroSlide, HeroSlideInput } from '@/types/hero-slide';
import styles from './SlideEditor.module.css';

interface SlideEditorProps {
  initialSlide?: HeroSlide | null;
  isNew?: boolean;
}

export function SlideEditor({ initialSlide, isNew = false }: SlideEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [uploadingDevice, setUploadingDevice] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<HeroSlideInput>>({
    internalName: initialSlide?.internalName || '',
    status: initialSlide?.status || 'draft',
    sortOrder: initialSlide?.sortOrder || 1,
    desktopImageUrl: initialSlide?.desktopImageUrl || null,
    tabletImageUrl: initialSlide?.tabletImageUrl || null,
    mobileImageUrl: initialSlide?.mobileImageUrl || null,
    desktopImageAlt: initialSlide?.desktopImageAlt || '',
    tabletImageAlt: initialSlide?.tabletImageAlt || '',
    mobileImageAlt: initialSlide?.mobileImageAlt || '',
    eyebrow: initialSlide?.eyebrow || 'RFC STORE',
    heading: initialSlide?.heading || 'BUILT FOR THE FIGHT.',
    description: initialSlide?.description || 'Professional combat equipment engineered for performance.',
    primaryButtonText: initialSlide?.primaryButtonText || 'SHOP NOW',
    primaryButtonUrl: initialSlide?.primaryButtonUrl || '/shop',
    secondaryButtonText: initialSlide?.secondaryButtonText || '',
    secondaryButtonUrl: initialSlide?.secondaryButtonUrl || '',
    textPosition: initialSlide?.textPosition || 'left',
    textAlignment: initialSlide?.textAlignment || 'left',
    overlayStrength: initialSlide?.overlayStrength || 'medium',
    slideDuration: initialSlide?.slideDuration || 5000,
    transitionStyle: initialSlide?.transitionStyle || 'fade',
    transitionSpeed: initialSlide?.transitionSpeed || 'normal',
    autoplay: initialSlide?.autoplay ?? true,
    pauseOnHover: initialSlide?.pauseOnHover ?? true,
  });

  const updateField = <K extends keyof HeroSlideInput>(field: K, value: HeroSlideInput[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDeviceUpload = async (
    device: 'desktop' | 'tablet' | 'mobile',
    files: FileList | null
  ) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    // Client validation
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrorMsg(`Invalid file type for ${device} image. Please upload JPEG, PNG, or WebP.`);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg(`File size for ${device} image exceeds 10MB limit.`);
      return;
    }

    setErrorMsg('');
    setUploadingDevice(device);

    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('slideId', initialSlide?.id || 'new');
      fd.append('device', device);

      const res = await fetch('/api/admin/hero-slides/upload', {
        method: 'POST',
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Upload failed.');
      } else {
        if (device === 'desktop') updateField('desktopImageUrl', data.url);
        if (device === 'tablet') updateField('tabletImageUrl', data.url);
        if (device === 'mobile') updateField('mobileImageUrl', data.url);
        setSuccessMsg(`${device.toUpperCase()} image uploaded successfully!`);
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch {
      setErrorMsg('Network error uploading image.');
    } finally {
      setUploadingDevice(null);
    }
  };

  const handleSave = (targetStatus?: 'draft' | 'published') => {
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.internalName?.trim()) {
      setErrorMsg('Internal slide name is required.');
      return;
    }
    if (!formData.heading?.trim()) {
      setErrorMsg('Main heading is required.');
      return;
    }

    const finalStatus = targetStatus || formData.status || 'draft';
    const payload = { ...formData, status: finalStatus };

    startTransition(async () => {
      let res;
      if (isNew || !initialSlide?.id) {
        res = await createHeroSlideAction(payload);
      } else {
        res = await updateHeroSlideAction(initialSlide.id, payload);
      }

      if (!res.success) {
        setErrorMsg(res.error || 'Save failed.');
      } else {
        setSuccessMsg(
          finalStatus === 'published' ? 'Slide published successfully!' : 'Slide draft saved!'
        );
        setTimeout(() => {
          router.push('/admin/media/hero-slideshow');
        }, 800);
      }
    });
  };

  return (
    <div className={styles.container}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <Link href="/admin/media/hero-slideshow" className={styles.backLink}>
          ← Back to Hero Slideshow
        </Link>

        <div className={styles.topActions}>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={() => handleSave('draft')}
            disabled={isPending}
          >
            {isPending ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={() => handleSave('published')}
            disabled={isPending}
          >
            {isPending ? 'Publishing...' : '🚀 Publish Slide'}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div style={{ padding: 14, background: '#fee2e2', color: '#991b1b', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
          ⚠️ {errorMsg}
        </div>
      )}
      {successMsg && (
        <div style={{ padding: 14, background: '#dcfce7', color: '#166534', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
          ✓ {successMsg}
        </div>
      )}

      {/* Editor Grid: Form (left) + Preview (right) */}
      <div className={styles.editorLayout}>
        <div className={styles.formGrid}>
          {/* Section 1: Basic Information */}
          <div className={styles.sectionBox}>
            <h2 className={styles.sectionTitle}>1. Basic Information</h2>
            <div className={styles.row2}>
              <div className={styles.field}>
                <label className={styles.label}>Internal Slide Name *</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g. Summer Combat Campaign 2026"
                  value={formData.internalName || ''}
                  onChange={(e) => updateField('internalName', e.target.value)}
                />
                <span className={styles.hint}>Admin management label — not shown on homepage.</span>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Status</label>
                <select
                  className={styles.select}
                  value={formData.status || 'draft'}
                  onChange={(e) => updateField('status', e.target.value as HeroSlideInput['status'])}
                >
                  <option value="draft">Draft (Not public)</option>
                  <option value="published">Published (Live on homepage)</option>
                  <option value="disabled">Disabled (Hidden)</option>
                </select>
                <span className={styles.hint}>Only Published slides appear on the public store.</span>
              </div>
            </div>
          </div>

          {/* Section 2: Device-Specific Images */}
          <div className={styles.sectionBox}>
            <h2 className={styles.sectionTitle}>2. Device-Specific Images</h2>
            <p className={styles.hint} style={{ marginTop: -12, marginBottom: 8 }}>
              Upload optimized assets per viewport. If tablet or mobile is omitted, desktop image will be used as fallback.
            </p>

            <div className={styles.row3}>
              {/* Desktop Image */}
              <div className={styles.imageUploadCard}>
                <div className={styles.deviceTitle}>
                  <span>🖥️ DESKTOP</span>
                  {formData.desktopImageUrl && <span style={{ color: '#166534' }}>✓ Uploaded</span>}
                </div>
                {formData.desktopImageUrl ? (
                  <>
                    <div className={styles.previewThumb}>
                      <Image src={formData.desktopImageUrl} alt="Desktop" fill className={styles.previewImage} unoptimized />
                    </div>
                    <div className={styles.imageActions}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#E63946', cursor: 'pointer' }}>
                        Replace
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          style={{ display: 'none' }}
                          onChange={(e) => handleDeviceUpload('desktop', e.target.files)}
                        />
                      </label>
                      <button type="button" className={styles.removeBtn} onClick={() => updateField('desktopImageUrl', null)}>
                        Remove
                      </button>
                    </div>
                  </>
                ) : (
                  <label className={styles.uploadBox}>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      style={{ display: 'none' }}
                      onChange={(e) => handleDeviceUpload('desktop', e.target.files)}
                    />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>
                      {uploadingDevice === 'desktop' ? 'Uploading...' : '+ Upload Desktop Image'}
                    </span>
                  </label>
                )}
                <span className={styles.hint}>
                  Recommended: <strong>1920 × 800 px</strong>
                  <br />
                  Wide landscape composition
                </span>
              </div>

              {/* Tablet Image */}
              <div className={styles.imageUploadCard}>
                <div className={styles.deviceTitle}>
                  <span>📱 TABLET</span>
                  {formData.tabletImageUrl && <span style={{ color: '#166534' }}>✓ Uploaded</span>}
                </div>
                {formData.tabletImageUrl ? (
                  <>
                    <div className={styles.previewThumb}>
                      <Image src={formData.tabletImageUrl} alt="Tablet" fill className={styles.previewImage} unoptimized />
                    </div>
                    <div className={styles.imageActions}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#E63946', cursor: 'pointer' }}>
                        Replace
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          style={{ display: 'none' }}
                          onChange={(e) => handleDeviceUpload('tablet', e.target.files)}
                        />
                      </label>
                      <button type="button" className={styles.removeBtn} onClick={() => updateField('tabletImageUrl', null)}>
                        Remove
                      </button>
                    </div>
                  </>
                ) : (
                  <label className={styles.uploadBox}>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      style={{ display: 'none' }}
                      onChange={(e) => handleDeviceUpload('tablet', e.target.files)}
                    />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>
                      {uploadingDevice === 'tablet' ? 'Uploading...' : '+ Upload Tablet Image'}
                    </span>
                  </label>
                )}
                <span className={styles.hint}>
                  Recommended: <strong>1280 × 900 px</strong>
                  <br />
                  Medium landscape framing
                </span>
              </div>

              {/* Mobile Image */}
              <div className={styles.imageUploadCard}>
                <div className={styles.deviceTitle}>
                  <span>📲 MOBILE</span>
                  {formData.mobileImageUrl && <span style={{ color: '#166534' }}>✓ Uploaded</span>}
                </div>
                {formData.mobileImageUrl ? (
                  <>
                    <div className={styles.previewThumb}>
                      <Image src={formData.mobileImageUrl} alt="Mobile" fill className={styles.previewImage} unoptimized />
                    </div>
                    <div className={styles.imageActions}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#E63946', cursor: 'pointer' }}>
                        Replace
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          style={{ display: 'none' }}
                          onChange={(e) => handleDeviceUpload('mobile', e.target.files)}
                        />
                      </label>
                      <button type="button" className={styles.removeBtn} onClick={() => updateField('mobileImageUrl', null)}>
                        Remove
                      </button>
                    </div>
                  </>
                ) : (
                  <label className={styles.uploadBox}>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      style={{ display: 'none' }}
                      onChange={(e) => handleDeviceUpload('mobile', e.target.files)}
                    />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>
                      {uploadingDevice === 'mobile' ? 'Uploading...' : '+ Upload Mobile Image'}
                    </span>
                  </label>
                )}
                <span className={styles.hint}>
                  Recommended: <strong>1080 × 1350 px</strong>
                  <br />
                  Portrait vertical composition
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Text Content */}
          <div className={styles.sectionBox}>
            <h2 className={styles.sectionTitle}>3. Slide Copy & Text Content</h2>

            <div className={styles.field}>
              <label className={styles.label}>Eyebrow / Small Label</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. REVIVE FIGHT CLUB"
                value={formData.eyebrow || ''}
                onChange={(e) => updateField('eyebrow', e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Main Heading *</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. BUILT FOR THE FIGHT."
                value={formData.heading || ''}
                onChange={(e) => updateField('heading', e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Description / Supporting Subtext</label>
              <textarea
                className={styles.textarea}
                placeholder="Professional grade equipment engineered for the arena..."
                value={formData.description || ''}
                onChange={(e) => updateField('description', e.target.value)}
              />
            </div>
          </div>

          {/* Section 4: Buttons & Actions */}
          <div className={styles.sectionBox}>
            <h2 className={styles.sectionTitle}>4. CTA Buttons & Links</h2>

            <div className={styles.row2}>
              <div className={styles.field}>
                <label className={styles.label}>Primary Button Text</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="SHOP NOW"
                  value={formData.primaryButtonText || ''}
                  onChange={(e) => updateField('primaryButtonText', e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Primary Button Destination URL</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="/shop"
                  value={formData.primaryButtonUrl || ''}
                  onChange={(e) => updateField('primaryButtonUrl', e.target.value)}
                />
              </div>
            </div>

            <div className={styles.row2}>
              <div className={styles.field}>
                <label className={styles.label}>Secondary Button Text (Optional)</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="EXPLORE COLLECTION"
                  value={formData.secondaryButtonText || ''}
                  onChange={(e) => updateField('secondaryButtonText', e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Secondary Button Destination URL</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="/category/boxing"
                  value={formData.secondaryButtonUrl || ''}
                  onChange={(e) => updateField('secondaryButtonUrl', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section 5: Layout & Readability */}
          <div className={styles.sectionBox}>
            <h2 className={styles.sectionTitle}>5. Layout & Readability Controls</h2>

            <div className={styles.row3}>
              <div className={styles.field}>
                <label className={styles.label}>Text Position</label>
                <select
                  className={styles.select}
                  value={formData.textPosition || 'left'}
                  onChange={(e) => updateField('textPosition', e.target.value as HeroSlideInput['textPosition'])}
                >
                  <option value="left">Left Aligned</option>
                  <option value="center">Centered</option>
                  <option value="right">Right Aligned</option>
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Text Alignment</label>
                <select
                  className={styles.select}
                  value={formData.textAlignment || 'left'}
                  onChange={(e) => updateField('textAlignment', e.target.value as HeroSlideInput['textAlignment'])}
                >
                  <option value="left">Left Text</option>
                  <option value="center">Center Text</option>
                  <option value="right">Right Text</option>
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Dark Overlay Strength</label>
                <select
                  className={styles.select}
                  value={formData.overlayStrength || 'medium'}
                  onChange={(e) => updateField('overlayStrength', e.target.value as HeroSlideInput['overlayStrength'])}
                >
                  <option value="none">None (0%)</option>
                  <option value="low">Low (35%)</option>
                  <option value="medium">Medium (60%)</option>
                  <option value="high">High (85%)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 6: Animation & Timing */}
          <div className={styles.sectionBox}>
            <h2 className={styles.sectionTitle}>6. Slideshow Timing & Transition Settings</h2>

            <div className={styles.row3}>
              <div className={styles.field}>
                <label className={styles.label}>Slide Display Duration</label>
                <select
                  className={styles.select}
                  value={formData.slideDuration || 5000}
                  onChange={(e) => updateField('slideDuration', Number(e.target.value))}
                >
                  <option value={3000}>3 Seconds</option>
                  <option value={4000}>4 Seconds</option>
                  <option value={5000}>5 Seconds (Recommended)</option>
                  <option value={6000}>6 Seconds</option>
                  <option value={8000}>8 Seconds</option>
                  <option value={10000}>10 Seconds</option>
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Transition Style</label>
                <select
                  className={styles.select}
                  value={formData.transitionStyle || 'fade'}
                  onChange={(e) => updateField('transitionStyle', e.target.value as HeroSlideInput['transitionStyle'])}
                >
                  <option value="fade">Fade</option>
                  <option value="slide">Slide Horizontal</option>
                  <option value="crossfade">Crossfade</option>
                  <option value="zoom">Subtle Zoom</option>
                  <option value="none">None (Instant)</option>
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Transition Speed</label>
                <select
                  className={styles.select}
                  value={formData.transitionSpeed || 'normal'}
                  onChange={(e) => updateField('transitionSpeed', e.target.value as HeroSlideInput['transitionSpeed'])}
                >
                  <option value="fast">Fast (300ms)</option>
                  <option value="normal">Normal (600ms)</option>
                  <option value="slow">Slow (900ms)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 24, marginTop: 8 }}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={formData.autoplay ?? true}
                  onChange={(e) => updateField('autoplay', e.target.checked)}
                />
                Autoplay Enabled
              </label>

              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={formData.pauseOnHover ?? true}
                  onChange={(e) => updateField('pauseOnHover', e.target.checked)}
                />
                Pause Autoplay on Hover
              </label>
            </div>
          </div>
        </div>

        {/* Live Preview Panel (Right Column) */}
        <div>
          <SlidePreview formData={formData} />
        </div>
      </div>
    </div>
  );
}
