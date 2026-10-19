import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        textAlign: 'center',
        backgroundColor: '#FAF7F2'
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'rgba(112, 26, 54, 0.08)',
          color: 'var(--color-burgundy)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px'
        }}
      >
        <Sparkles size={24} />
      </div>

      <span
        style={{
          fontSize: '0.8rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--color-gold)',
          fontWeight: 600,
          marginBottom: '8px'
        }}
      >
        404 — PAGE NOT FOUND
      </span>

      <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', marginBottom: '16px' }}>
        The Piece You Seek Is Elsewhere
      </h1>

      <p style={{ maxWidth: '480px', color: 'var(--color-text-muted)', marginBottom: '32px', fontSize: '0.95rem' }}>
        The link you followed may have expired, or the collection page has been moved. Explore our latest artisanal edits.
      </p>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/" className="btn btn-primary">
          <ArrowLeft size={16} /> Return Home
        </Link>
        <Link href="/shop" className="btn btn-outline">
          Explore Jewellery Catalogue
        </Link>
      </div>
    </div>
  );
}
