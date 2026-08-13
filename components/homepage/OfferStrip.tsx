"use client";
/**
 * RFC Store — Offer Strip
 *
 * Animated marquee banner. Light theme — matches the website's
 * commerce surface. Dark text on white/light bg with RFC red accents.
 */

const OFFERS = [
  { icon: "🚚", label: "FREE SHIPPING ON ORDERS ABOVE ₹999" },
  { icon: "⚡", label: "FAST DISPATCH WITHIN 24 HOURS" },
  { icon: "🏆", label: "TRUSTED BY 10,000+ FIGHTERS" },
  { icon: "🔄", label: "EASY 7-DAY RETURNS" },
  { icon: "🛡️", label: "100% AUTHENTIC PRODUCTS" },
  { icon: "🥊", label: "PREMIUM FIGHT GEAR — PRO QUALITY" },
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
              <span className="offer-strip-sep" aria-hidden="true">★</span>
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
          background-color: var(--rfc-surface, #ffffff);
          border-top: 1px solid var(--rfc-border, #E5E7EB);
          border-bottom: 1px solid var(--rfc-border, #E5E7EB);
          overflow: hidden;
          height: 44px;
          display: flex;
          align-items: center;
        }

        /* ── Fades ─────────────────────────────────────────── */
        .offer-strip-fade {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 60px;
          z-index: 2;
          pointer-events: none;
        }

        .offer-strip-fade--left {
          left: 0;
          background: linear-gradient(to right, var(--rfc-surface, #ffffff) 0%, transparent 100%);
        }

        .offer-strip-fade--right {
          right: 0;
          background: linear-gradient(to left, var(--rfc-surface, #ffffff) 0%, transparent 100%);
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
          animation: offer-marquee 40s linear infinite;
          will-change: transform;
        }

        .offer-strip-root:hover .offer-strip-list {
          animation-play-state: paused;
        }

        /* ── Item ───────────────────────────────────────────── */
        .offer-strip-item {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0 18px;
          flex-shrink: 0;
        }

        /* ── Icon ───────────────────────────────────────────── */
        .offer-strip-icon {
          font-size: 13px;
          line-height: 1;
          flex-shrink: 0;
        }

        /* ── Label ──────────────────────────────────────────── */
        .offer-strip-label {
          font-family: var(--font-label, 'Inter', sans-serif);
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--rfc-text, #0D1B2A);
          flex-shrink: 0;
        }

        /* ── Separator star ─────────────────────────────────── */
        .offer-strip-sep {
          font-size: 8px;
          color: var(--rfc-accent, #E63946);
          flex-shrink: 0;
          line-height: 1;
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
