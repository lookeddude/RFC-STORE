"use client";
/**
 * RFC Store — Offer Strip
 *
 * Animated marquee banner below Hero.
 * Uses RFC design tokens — deep charcoal bg, ONE red accent separator.
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
              <span className="offer-strip-icon">{item.icon}</span>
              <span className="offer-strip-label">{item.label}</span>
              <span className="offer-strip-sep" aria-hidden="true">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
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
        /* ── Root ─────────────────────────────────────────── */
        .offer-strip-root {
          position: relative;
          width: 100%;
          background-color: var(--rfc-dark, #111827);
          border-top: 1px solid rgba(230, 57, 70, 0.2);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          overflow: hidden;
          height: 48px;
          display: flex;
          align-items: center;
        }

        /* ── Fades ─────────────────────────────────────────── */
        .offer-strip-fade {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 64px;
          z-index: 2;
          pointer-events: none;
        }

        .offer-strip-fade--left {
          left: 0;
          background: linear-gradient(to right, var(--rfc-dark, #111827) 0%, transparent 100%);
        }

        .offer-strip-fade--right {
          right: 0;
          background: linear-gradient(to left, var(--rfc-dark, #111827) 0%, transparent 100%);
        }

        /* ── Track ─────────────────────────────────────────── */
        .offer-strip-track {
          display: flex;
          align-items: center;
          width: 100%;
          overflow: hidden;
        }

        /* ── List ───────────────────────────────────────────── */
        .offer-strip-list {
          display: flex;
          align-items: center;
          list-style: none;
          margin: 0;
          padding: 0;
          white-space: nowrap;
          animation: offer-marquee 38s linear infinite;
          will-change: transform;
        }

        .offer-strip-root:hover .offer-strip-list {
          animation-play-state: paused;
        }

        /* ── Item ───────────────────────────────────────────── */
        .offer-strip-item {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 0 20px;
          flex-shrink: 0;
        }

        /* ── Icon ───────────────────────────────────────────── */
        .offer-strip-icon {
          font-size: 14px;
          line-height: 1;
          flex-shrink: 0;
        }

        /* ── Label ──────────────────────────────────────────── */
        .offer-strip-label {
          font-family: var(--font-label, 'Inter', sans-serif);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(249, 250, 251, 0.82);
          flex-shrink: 0;
        }

        /* ── Separator ──────────────────────────────────────── */
        .offer-strip-sep {
          color: var(--rfc-accent, #E63946);
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          opacity: 0.75;
        }

        /* ── Keyframes ──────────────────────────────────────── */
        @keyframes offer-marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        /* ── Reduced motion ─────────────────────────────────── */
        @media (prefers-reduced-motion: reduce) {
          .offer-strip-list { animation: none; }
        }
      `}</style>
    </div>
  );
}
