'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[RFC Store] Admin error:', error.digest ?? error.message);
  }, [error]);

  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'sans-serif',
      textAlign: 'center',
    }}>
      <p style={{
        fontSize: '0.75rem',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: '#888',
        marginBottom: '1rem',
      }}>
        Admin Panel Error
      </p>
      <h1 style={{
        fontSize: '1.5rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: '0.75rem',
        color: '#fff',
      }}>
        Something went wrong
      </h1>
      <p style={{
        fontSize: '0.9rem',
        color: '#888',
        marginBottom: '2rem',
        maxWidth: '400px',
      }}>
        An unexpected error occurred in the admin panel.
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
            background: '#E63946',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          Try Again
        </button>
        <Link
          href="/admin"
          style={{
            padding: '0.75rem 1.5rem',
            background: 'transparent',
            color: '#fff',
            border: '1px solid #333',
            textDecoration: 'none',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
