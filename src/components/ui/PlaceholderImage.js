'use client';

import React, { useState } from 'react';

/**
 * PlaceholderImage Component
 * Prevents broken image icons and cumulative layout shifts.
 * Renders local SVG or graceful fallback placeholder.
 */
export default function PlaceholderImage({
  src,
  alt = 'NISHKÈA jewellery asset',
  aspectRatio = '1 / 1',
  category = '',
  className = '',
  priority = false
}) {
  const [hasError, setHasError] = useState(false);

  return (
    <div
      style={{
        aspectRatio: aspectRatio,
        width: '100%',
        backgroundColor: '#FAF7F2',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid #E7DDE0'
      }}
      className={className}
    >
      {!hasError && src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          onError={() => setHasError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      ) : (
        <div
          style={{
            padding: '16px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'rgba(112, 26, 54, 0.08)',
              color: '#701A36',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: '600'
            }}
          >
            ✦
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#701A36', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {category || 'Jewellery Asset'}
          </span>
          <span style={{ fontSize: '0.7rem', color: '#6D6268' }}>
            [Placeholder • Awaiting Approved Media]
          </span>
        </div>
      )}
    </div>
  );
}
