'use client';

/**
 * RFC Store — Admin Slide Live Preview
 *
 * Real-time responsive visual preview for Desktop (1920x800 aspect),
 * Tablet (1280x900 aspect), and Mobile (1080x1350 aspect).
 */
import { useState } from 'react';
import Image from 'next/image';
import type { HeroSlideInput } from '@/types/hero-slide';

interface SlidePreviewProps {
  formData: Partial<HeroSlideInput>;
}

export function SlidePreview({ formData }: SlidePreviewProps) {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Fallback image chain
  const imageUrl =
    device === 'mobile'
      ? formData.mobileImageUrl || formData.tabletImageUrl || formData.desktopImageUrl
      : device === 'tablet'
      ? formData.tabletImageUrl || formData.desktopImageUrl
      : formData.desktopImageUrl || formData.tabletImageUrl || formData.mobileImageUrl;

  const overlayOpacity =
    formData.overlayStrength === 'none'
      ? 0
      : formData.overlayStrength === 'low'
      ? 0.35
      : formData.overlayStrength === 'high'
      ? 0.85
      : 0.6; // medium default

  const textPos = formData.textPosition || 'left';
  const textAlign = formData.textAlignment || 'left';

  return (
    <div
      style={{
        background: '#111827',
        borderRadius: 12,
        padding: 20,
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        position: 'sticky',
        top: 24,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          paddingBottom: 12,
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#E63946',
          }}
        >
          Live Preview
        </span>

        {/* Viewport Selector */}
        <div style={{ display: 'flex', gap: 6, background: '#1F2937', padding: 3, borderRadius: 6 }}>
          {(['desktop', 'tablet', 'mobile'] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDevice(d)}
              style={{
                padding: '4px 10px',
                borderRadius: 4,
                border: 'none',
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                cursor: 'pointer',
                background: device === d ? '#E63946' : 'transparent',
                color: device === d ? '#ffffff' : '#9CA3AF',
                transition: 'all 0.15s ease',
              }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Frame Container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: device === 'mobile' ? '9/14' : device === 'tablet' ? '4/3' : '16/9',
          background: '#0d131f',
          borderRadius: 8,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: textPos === 'center' ? 'center' : textPos === 'right' ? 'flex-end' : 'flex-start',
          padding: '24px 20px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          transition: 'aspect-ratio 0.3s ease',
        }}
      >
        {/* Image */}
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt="Preview background"
            fill
            style={{ objectFit: 'cover' }}
            unoptimized
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#4B5563',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            No {device} image uploaded
          </div>
        )}

        {/* Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(to right, rgba(17,24,39,${overlayOpacity}) 0%, rgba(17,24,39,${overlayOpacity * 0.4}) 100%)`,
            zIndex: 1,
          }}
        />

        {/* Text Content */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            maxWidth: device === 'mobile' ? '100%' : '80%',
            textAlign: textAlign,
            display: 'flex',
            flexDirection: 'column',
            alignItems: textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start',
            gap: 6,
          }}
        >
          {formData.eyebrow && (
            <span
              style={{
                fontFamily: 'Inter',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: '#E63946',
              }}
            >
              {formData.eyebrow}
            </span>
          )}

          <h2
            style={{
              fontFamily: 'Archivo Narrow, sans-serif',
              fontSize: device === 'mobile' ? 22 : 28,
              fontWeight: 900,
              lineHeight: 1,
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              color: '#ffffff',
              margin: 0,
            }}
          >
            {formData.heading || 'BUILT FOR THE FIGHT.'}
          </h2>

          {formData.description && (
            <p
              style={{
                fontSize: 11,
                lineHeight: 1.4,
                color: '#9CA3AF',
                margin: 0,
                maxWidth: 320,
              }}
            >
              {formData.description}
            </p>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
            {formData.primaryButtonText && (
              <span
                style={{
                  padding: '6px 14px',
                  background: '#E63946',
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 800,
                  borderRadius: 2,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {formData.primaryButtonText}
              </span>
            )}
            {formData.secondaryButtonText && (
              <span
                style={{
                  padding: '6px 14px',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.4)',
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 800,
                  borderRadius: 2,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {formData.secondaryButtonText}
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={{ fontSize: 11, color: '#6b7280', textAlign: 'center' }}>
        Preview uses current device image fallback chain
      </div>
    </div>
  );
}
