/**
 * RFC Store — Offer Strip
 *
 * Animated marquee banner. Light theme — matches the website's
 * commerce surface. Dark text on white/light bg with RFC red accents.
 * Polished: emoji replaced with authored SVG icons. will-change removed
 * from permanent declaration (browser handles animated layers natively).
 */

const OFFERS = [
  {
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
        <rect x="9" y="11" width="14" height="10" rx="2"/>
        <circle cx="12" cy="16" r="1"/>
      </svg>
    ),
    label: "FREE SHIPPING ON ORDERS ABOVE ₹999",
  },
  {
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
    label: "FAST DISPATCH WITHIN 24 HOURS",
  },
  {
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
        <path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
      </svg>
    ),
    label: "TRUSTED BY 10,000+ FIGHTERS",
  },
  {
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
        <path d="M3 3v5h5"/>
      </svg>
    ),
    label: "EASY 7-DAY RETURNS",
  },
  {
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    label: "100% AUTHENTIC PRODUCTS",
  },
  {
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
      </svg>
    ),
    label: "PREMIUM FIGHT GEAR — PRO QUALITY",
  },
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
              <span className="offer-strip-sep" aria-hidden="true" />
            </li>
          ))}
        </ul>
      </div>

      {/* Right fade */}
      <div className="offer-strip-fade offer-strip-fade--right" aria-hidden="true" />

      <style>{`
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

        .offer-strip-fade {
          position: absolute;
          top: 0; bottom: 0;
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

        .offer-strip-track {
          display: flex;
          align-items: center;
          width: 100%;
          overflow: hidden;
        }

        .offer-strip-list {
          display: flex;
          align-items: center;
          list-style: none;
          margin: 0;
          padding: 0;
          white-space: nowrap;
          animation: offer-marquee 40s linear infinite;
        }
        .offer-strip-root:hover .offer-strip-list {
          animation-play-state: paused;
        }

        .offer-strip-item {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0 18px;
          flex-shrink: 0;
        }

        .offer-strip-icon {
          display: flex;
          align-items: center;
          color: var(--rfc-accent, #E63946);
          flex-shrink: 0;
        }

        .offer-strip-label {
          font-family: var(--font-label, 'Inter', sans-serif);
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--rfc-text, #0D1B2A);
          flex-shrink: 0;
        }

        /* Small red dot separator */
        .offer-strip-sep {
          display: inline-block;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background-color: var(--rfc-accent, #E63946);
          flex-shrink: 0;
        }

        @keyframes offer-marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        @media (prefers-reduced-motion: reduce) {
          .offer-strip-list { animation: none; }
        }
      `}</style>
    </div>
  );
}
