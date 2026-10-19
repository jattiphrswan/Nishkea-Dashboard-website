'use client';

import React from 'react';
import Link from 'next/link';
import { CATEGORIES, PRODUCTS } from '../../data/fixtures';
import ProductCard from '../../components/storefront/ProductCard';
import PlaceholderImage from '../../components/ui/PlaceholderImage';
import { Sparkles, ArrowRight, ShieldCheck, Gem, RefreshCw } from 'lucide-react';

export default function HomePage() {
  const featuredProducts = PRODUCTS.slice(0, 4);
  const newArrivals = PRODUCTS.filter((p) => p.isNew).slice(0, 4);

  return (
    <div style={{ paddingBottom: 'var(--space-16)' }}>
      {/* Editorial Hero Section */}
      <section className="hero-section" aria-label="Autumn Campaign Hero">
        <div className="container-storefront" style={{ padding: 0 }}>
          <div style={{ position: 'relative' }}>
            <picture>
              <source media="(max-width: 767px)" srcSet="/images/hero/1.png" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/hero/1.png"
                alt="NISHKÈA Handcrafted Elegance — The Autumn Edit 2026"
                className="hero-banner"
                loading="eager"
                style={{ width: '100%', maxHeight: '680px', objectFit: 'cover' }}
              />
            </picture>

            {/* Accessible Overlay Content */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                width: '100%',
                maxWidth: '650px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: 'var(--space-8)'
              }}
            >
              <div style={{ marginBottom: '16px' }}>
                <span className="badge badge-burgundy" style={{ letterSpacing: '0.15em' }}>
                  AUTUMN 2026 COLLECTION
                </span>
              </div>
              <h1
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(2.4rem, 4.5vw, 4rem)',
                  color: 'var(--color-text-main)',
                  lineHeight: 1.15,
                  marginBottom: '16px'
                }}
              >
                Artisanal Jewellery, <br />
                <span style={{ color: 'var(--color-burgundy)', fontStyle: 'italic' }}>
                  Handcrafted for You
                </span>
              </h1>
              <p
                style={{
                  fontSize: '1rem',
                  color: 'var(--color-text-muted)',
                  maxWidth: '460px',
                  marginBottom: '28px'
                }}
              >
                Discover 159+ distinctive designs across earrings, cocktail bands, tiered necklaces, silk adornments, and heritage naths.
              </p>
              <div>
                <Link href="/shop" className="btn btn-primary" style={{ padding: '14px 32px' }}>
                  Explore Collection <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Values Strip */}
      <section
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid var(--color-border)',
          padding: 'var(--space-6) 0'
        }}
      >
        <div className="container-storefront">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--space-6)',
              textAlign: 'center'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <Gem size={22} color="var(--color-burgundy)" />
              <strong style={{ fontSize: '0.84rem', letterSpacing: '0.04em' }}>159+ DISTINCT DESIGNS</strong>
              <span style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>Curated across 5 core categories</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <RefreshCw size={22} color="var(--color-burgundy)" />
              <strong style={{ fontSize: '0.84rem', letterSpacing: '0.04em' }}>30-DAY TREND CYCLES</strong>
              <span style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>Rigorous monthly collection reviews</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={22} color="var(--color-burgundy)" />
              <strong style={{ fontSize: '0.84rem', letterSpacing: '0.04em' }}>TRANSACTIONAL INVENTORY</strong>
              <span style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>Real stock availability &amp; zero overselling</span>
            </div>
          </div>
        </div>
      </section>

      {/* Five Core Categories Section */}
      <section style={{ padding: 'var(--space-16) 0 var(--space-8)' }} aria-labelledby="categories-heading">
        <div className="container-storefront">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
            <span style={{ fontSize: '0.78rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-burgundy)', fontWeight: 600 }}>
              Curated Silhouette Showcase
            </span>
            <h2 id="categories-heading" style={{ marginTop: '8px' }}>Explore by Category</h2>
            <p style={{ maxWidth: '540px', margin: '8px auto 0' }}>
              Every category follows strict jewellery standards: earrings sold as pairs, rings in verified sizes, and necklaces with exact chain lengths.
            </p>
          </div>

          <div className="category-grid">
            {CATEGORIES.map((cat) => (
              <Link key={cat.id} href={`/shop?category=${cat.slug}`} className="category-tile">
                <div className="category-tile-media">
                  <PlaceholderImage src={cat.image} alt={cat.name} category={cat.name} />
                </div>
                <div className="category-tile-info">
                  <h3 className="category-tile-title">{cat.name}</h3>
                  <span className="category-tile-count">{cat.estimatedDesigns}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Pieces */}
      <section style={{ padding: 'var(--space-12) 0' }} aria-labelledby="featured-heading">
        <div className="container-storefront">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 'var(--space-8)' }}>
            <div>
              <span style={{ fontSize: '0.78rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-gold)', fontWeight: 600 }}>
                Signature Showcase
              </span>
              <h2 id="featured-heading" style={{ marginTop: '4px' }}>Featured Designs</h2>
            </div>
            <Link href="/shop" className="btn btn-outline btn-sm">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="product-grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Editorial Story Section */}
      <section style={{ padding: 'var(--space-12) 0' }}>
        <div className="container-storefront">
          <div
            style={{
              backgroundColor: '#55132A',
              color: '#FAF7F2',
              borderRadius: 'var(--radius-xs)',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/editorial/1.png"
              alt="The Velvet & Gold Monthly Trend Edit"
              style={{ width: '100%', maxHeight: '520px', objectFit: 'cover', display: 'block' }}
            />
            <div
              style={{
                padding: 'var(--space-8)',
                textAlign: 'center',
                backgroundColor: 'rgba(85, 19, 42, 0.95)',
                borderTop: '1px solid rgba(182, 151, 99, 0.4)'
              }}
            >
              <h3 style={{ color: '#FAF7F2', fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '12px' }}>
                The 30-Day Collection Discipline
              </h3>
              <p style={{ maxWidth: '640px', margin: '0 auto 20px', color: '#E7DDE0', fontSize: '0.92rem' }}>
                Unlike mass-market brands, NISHKÈA subjects all trendy releases to an automated 30-day decision gate. High-performing pieces become permanent staples; under-performing pieces transition directly to limited clearance to prevent warehouse deadstock.
              </p>
              <Link href="/shop" className="btn btn-secondary" style={{ color: '#FAF7F2', borderColor: '#FAF7F2' }}>
                Shop The Autumn Edit
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section style={{ padding: 'var(--space-12) 0' }} aria-labelledby="new-arrivals-heading">
        <div className="container-storefront">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 'var(--space-8)' }}>
            <div>
              <span style={{ fontSize: '0.78rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-burgundy)', fontWeight: 600 }}>
                Just Added
              </span>
              <h2 id="new-arrivals-heading" style={{ marginTop: '4px' }}>Fresh Arrivals</h2>
            </div>
            <Link href="/shop" className="btn btn-outline btn-sm">
              Discover All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="product-grid">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Craftsmanship Brand Story */}
      <section
        style={{
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid var(--color-border)',
          borderBottom: '1px solid var(--color-border)',
          padding: 'var(--space-16) 0',
          marginTop: 'var(--space-12)'
        }}
      >
        <div className="container-storefront">
          <div style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'center' }}>
            <span style={{ color: 'var(--color-gold)', fontSize: '20px', display: 'block', marginBottom: '8px' }}>✦</span>
            <h2 style={{ fontSize: '2.4rem', marginBottom: '16px' }}>The Philosophy of NISHKÈA</h2>
            <p
              style={{
                fontSize: '1.05rem',
                lineHeight: 1.8,
                color: 'var(--color-text-main)',
                fontFamily: 'var(--font-serif)',
                marginBottom: '24px'
              }}
            >
              “Every jewel is a conversation between personal identity and timeless adornment. We believe luxury is found in precision of proportion, integrity of materials, and transparency of craftsmanship.”
            </p>
            <div style={{ display: 'inline-block', borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
              <span style={{ fontSize: '0.82rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-burgundy)', fontWeight: 600 }}>
                IT SUITS YOU !
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
