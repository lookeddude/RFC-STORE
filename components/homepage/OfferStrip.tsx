/**
 * RFC Store — RFC Standard Strip
 *
 * Premium information strip replacing the old marquee.
 * Horizontal composition on desktop, scroll/snap on mobile.
 */

const OFFERS = [
  { icon: "🛡️", label: "PRO-GRADE" },
  { icon: "⚡", label: "FAST DISPATCH" },
  { icon: "🔄", label: "EASY RETURNS" },
  { icon: "✓", label: "AUTHENTIC GEAR" },
];

export function OfferStrip() {
  return (
    <div className="rfc-standard-root" aria-label="RFC Standard Benefits">
      <div className="rfc-standard-container">
        <div className="rfc-standard-heading">
          RFC STANDARD
        </div>
        
        <ul className="rfc-standard-list" role="list">
          {OFFERS.map((item, i) => (
            <li key={i} className="rfc-standard-item">
              <span className="rfc-standard-icon" aria-hidden="true">{item.icon}</span>
              <span className="rfc-standard-label">{item.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <style>{`
        /* ── Root ─────────────────────────────────────────── */
        .rfc-standard-root {
          width: 100%;
          background-color: var(--rfc-dark, #171717);
          color: var(--rfc-text-inv, #fff);
          border-top: 1px solid var(--rfc-border-dark, rgba(255,255,255,0.08));
          border-bottom: 1px solid var(--rfc-border-dark, rgba(255,255,255,0.08));
          overflow: hidden;
        }

        .rfc-standard-container {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          height: 48px;
        }

        /* ── Heading ──────────────────────────────────────── */
        .rfc-standard-heading {
          font-family: var(--font-headline);
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 0.1em;
          padding: 0 24px;
          background-color: var(--rfc-accent, #D62828);
          color: #ffffff;
          height: 100%;
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        /* ── List ─────────────────────────────────────────── */
        .rfc-standard-list {
          display: flex;
          align-items: center;
          list-style: none;
          margin: 0;
          padding: 0 16px;
          gap: 32px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
          flex: 1;
          height: 100%;
        }
        
        .rfc-standard-list::-webkit-scrollbar {
          display: none;
        }

        /* ── Item ─────────────────────────────────────────── */
        .rfc-standard-item {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
          scroll-snap-align: start;
        }

        /* ── Icon & Label ─────────────────────────────────── */
        .rfc-standard-icon {
          font-size: 12px;
          color: var(--rfc-text-inv-muted, #9ca3af);
        }

        .rfc-standard-label {
          font-family: var(--font-label);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        @media (max-width: 768px) {
          .rfc-standard-heading {
            padding: 0 16px;
            font-size: 12px;
          }
          .rfc-standard-list {
            gap: 24px;
            padding: 0 16px;
          }
        }
      `}</style>
    </div>
  );
}
