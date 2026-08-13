"use client";
/**
 * RFC Store — Offer Strip (Homepage)
 *
 * Premium animated marquee banner — placed directly after the Hero section.
 * Replaces the plain fixed AnnouncementBar.
 *
 * Design:
 *  - Dark charcoal base (#0a0e14) with subtle diagonal grain texture
 *  - Continuous CSS marquee animation (infinite scroll left)
 *  - Red accent separator icons between items
 *  - Each item has a distinct icon + label pair
 *  - Subtle shimmer / glow on the red dividers
 *  - Pause-on-hover via CSS
 *  - Fully responsive
 */

const OFFERS = [
  { icon: "🚚", label: "FREE SHIPPING ON ORDERS ABOVE ₹999" },
  { icon: "🥊", label: "PREMIUM FIGHT GEAR — PRO QUALITY" },
  { icon: "🔄", label: "EASY 7-DAY RETURNS" },
  { icon: "🛡️", label: "100% AUTHENTIC PRODUCTS" },
  { icon: "⚡", label: "FAST DISPATCH WITHIN 24 HOURS" },
  { icon: "🏆", label: "TRUSTED BY 10,000+ FIGHTERS" },
];

// Duplicate for seamless infinite loop
const ITEMS = [...OFFERS, ...OFFERS];

export function OfferStrip() {
  return (
    <div className="offer-strip-root" aria-label="Store offers and benefits">
      {/* Left fade */}
      <div className="offer-strip-fade offer-strip-fade--left" aria-hidden="true" />

      {/* Scrolling track */}
      <div className="offer-strip-track" aria-hidden="true">
        <ul className="offer-strip-list" role="list">
          {ITEMS.map((item, i) => (
            <li key={i} className="offer-strip-item">
              {/* Icon */}
              <span className="offer-strip-icon">{item.icon}</span>

              {/* Label */}
              <span className="offer-strip-label">{item.label}</span>

              {/* Separator */}
              <span className="offer-strip-sep" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                </svg>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Right fade */}
      <div className="offer-strip-fade offer-strip-fade--right" aria-hidden="true" />

      <style>{`
        /* ── Root ─────────────────────────────────────────────────── */
        .offer-strip-root {
          position: relative;
          width: 100%;
          background: #0a0e14;
          border-top: 1px solid rgba(230, 57, 70, 0.3);
          border-bottom: 1px solid rgba(230, 57, 70, 0.15);
          overflow: hidden;
          height: 52px;
          display: flex;
          align-items: center;

          /* Diagonal grain texture via repeating-linear-gradient */
          background-image:
            repeating-linear-gradient(
              110deg,
              transparent,
              transparent 20px,
              rgba(255,255,255,0.012) 20px,
              rgba(255,255,255,0.012) 21px
            ),
            linear-gradient(180deg, #0f131a 0%, #0a0e14 50%, #0f131a 100%);
        }

        /* ── Fades ─────────────────────────────────────────────────── */
        .offer-strip-fade {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 80px;
          z-index: 2;
          pointer-events: none;
        }

        .offer-strip-fade--left {
          left: 0;
          background: linear-gradient(to right, #0a0e14 0%, transparent 100%);
        }

        .offer-strip-fade--right {
          right: 0;
          background: linear-gradient(to left, #0a0e14 0%, transparent 100%);
        }

        /* ── Track ─────────────────────────────────────────────────── */
        .offer-strip-track {
          display: flex;
          align-items: center;
          width: 100%;
          overflow: hidden;
        }

        /* ── List ──────────────────────────────────────────────────── */
        .offer-strip-list {
          display: flex;
          align-items: center;
          list-style: none;
          margin: 0;
          padding: 0;
          white-space: nowrap;
          animation: offer-marquee 36s linear infinite;
          will-change: transform;
          gap: 0;
        }

        /* Pause on hover */
        .offer-strip-root:hover .offer-strip-list {
          animation-play-state: paused;
        }

        /* ── Item ──────────────────────────────────────────────────── */
        .offer-strip-item {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 0 24px;
          flex-shrink: 0;
        }

        /* ── Icon ──────────────────────────────────────────────────── */
        .offer-strip-icon {
          font-size: 15px;
          line-height: 1;
          flex-shrink: 0;
        }

        /* ── Label ─────────────────────────────────────────────────── */
        .offer-strip-label {
          font-family: var(--font-label, 'Inter', sans-serif);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.88);
          flex-shrink: 0;
        }

        /* ── Separator star ────────────────────────────────────────── */
        .offer-strip-sep {
          color: #E63946;
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;

          /* Pulsing glow on the red star */
          animation: offer-sep-pulse 2.4s ease-in-out infinite alternate;
          filter: drop-shadow(0 0 4px rgba(230, 57, 70, 0.6));
        }

        /* ── Keyframes ─────────────────────────────────────────────── */
        @keyframes offer-marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        @keyframes offer-sep-pulse {
          from { filter: drop-shadow(0 0 3px rgba(230, 57, 70, 0.4)); opacity: 0.7; }
          to   { filter: drop-shadow(0 0 7px rgba(230, 57, 70, 0.9)); opacity: 1; }
        }

        /* ── Reduced motion ────────────────────────────────────────── */
        @media (prefers-reduced-motion: reduce) {
          .offer-strip-list {
            animation: none;
          }
          .offer-strip-sep {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
