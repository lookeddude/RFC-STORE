'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function StorefrontError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to Sentry or console in production
    console.error('[RFC Store] Storefront error:', error.digest ?? error.message);
  }, [error]);

  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'var(--font-body, sans-serif)',
      textAlign: 'center',
    }}>
      <p style={{
        fontSize: '0.75rem',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'var(--rfc-text-muted, #888)',
        marginBottom: '1rem',
      }}>
        Something went wrong
      </p>
      <h1 style={{
        fontSize: '1.5rem',
        fontFamily: 'var(--font-headline, sans-serif)',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: '0.75rem',
        color: 'var(--rfc-text, #fff)',
      }}>
        Page Error
      </h1>
      <p style={{
        fontSize: '0.9rem',
        color: 'var(--rfc-text-muted, #888)',
        marginBottom: '2rem',
        maxWidth: '400px',
      }}>
        An unexpected error occurred. Our team has been notified.
        {error.digest && (
          <span style={{ display: 'block', fontSize: '0.75rem', marginTop: '0.5rem', opacity: 0.6 }}>
            Error ID: {error.digest}
          </span>
        )}
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={reset}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'var(--rfc-accent, #E63946)',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-label, sans-serif)',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          Try Again
        </button>
        <Link
          href="/shop"
          style={{
            padding: '0.75rem 1.5rem',
            background: 'transparent',
            color: 'var(--rfc-text, #fff)',
            border: '1px solid var(--rfc-border, #333)',
            textDecoration: 'none',
            fontFamily: 'var(--font-label, sans-serif)',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          Back to Shop
        </Link>
      </div>
    </div>
  );
}
