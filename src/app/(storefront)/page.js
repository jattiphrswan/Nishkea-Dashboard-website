'use client';

import React from 'react';
import Link from 'next/link';
import { CATEGORIES, PRODUCTS, HERO_GALLERY } from '../../data/fixtures';
import ProductCard from '../../components/storefront/ProductCard';
import EditorialShowcase from '../../components/storefront/EditorialShowcase';
import PlaceholderImage from '../../components/ui/PlaceholderImage';
import { ArrowRight, Gem, ShieldCheck, RefreshCw, Sparkles, Award } from 'lucide-react';

export default function HomePage() {
  const featured = PRODUCTS.slice(0, 4);
  const lookbook = HERO_GALLERY.slice(0, 8);

  return (
    <div style={{ paddingBottom: 'var(--space-16)' }}>
      {/* Screenshot Reference Hero Section */}
      <section className="hero-ref-container" aria-label="TERONA & NISHKÈA Hero Campaign">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/hero/hero-ruby-silk.jpg"
          alt="18K Gold Curb Chain with Emerald-Cut Ruby Pendant on Crimson Silk"
          className="hero-ref-bg"
          loading="eager"
        />

        <div className="hero-ref-overlay">
          <div className="hero-ref-content">
            <h1 className="hero-ref-title">
              LIGHT, RENDERED<br />
              ETERNAL.
            </h1>
            <p className="hero-ref-sub">
              Hand-set diamonds and 18K gold, composed by our atelier in Paris.
            </p>
            <Link href="/shop" className="hero-ref-btn" id="hero-discover-btn">
              Discover the Collection <ArrowRight size={17} />
            </Link>
          </div>
        </div>

        {/* Seamless Bottom Organic Wave */}
        <svg
          className="hero-ref-wave"
          viewBox="0 0 1440 90"
          fill="none"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0,90 L1440,90 L1440,45 Q1000,90 600,30 Q300,-10 0,60 Z"
            fill="#FAF7F2"
          />
        </svg>
      </section>

      {/* Trust Values */}
      <section style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--color-border)', padding: '20px 0' }}>
        <div className="container-storefront">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', textAlign: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <Gem size={20} color="var(--color-burgundy)" />
              <strong style={{ fontSize: '0.82rem', letterSpacing: '0.06em' }}>159+ ATELIER DESIGNS</strong>
              <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>Solid 18K vermeil, silk and fine stones</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <RefreshCw size={20} color="var(--color-burgundy)" />
              <strong style={{ fontSize: '0.82rem', letterSpacing: '0.06em' }}>30-DAY TREND CYCLES</strong>
              <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>Curated monthly capsule edits</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={20} color="var(--color-burgundy)" />
              <strong style={{ fontSize: '0.82rem', letterSpacing: '0.06em' }}>TRANSACTIONAL LEDGER</strong>
              <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>Live inventory with zero overselling</span>
            </div>
          </div>
        </div>
      </section>

      {/* Luxury Editorial Showcase (Reference Style Bento Grid) */}
      <EditorialShowcase />

      {/* Core Categories with Uploaded Photography */}
      <section style={{ padding: 'var(--space-12) 0 var(--space-8)' }}>
        <div className="container-storefront">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
            <span style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-burgundy)', fontWeight: 600 }}>
              Curated Silhouettes
            </span>
            <h2 style={{ marginTop: '6px' }}>Explore by Category</h2>
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
      <section style={{ padding: 'var(--space-12) 0' }}>
        <div className="container-storefront">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 'var(--space-8)' }}>
            <div>
              <span style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-gold)', fontWeight: 600 }}>
                Signature Collection
              </span>
              <h2 style={{ marginTop: '4px' }}>Featured Designs</h2>
            </div>
            <Link href="/shop" className="btn btn-outline btn-sm">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="product-grid">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Atelier Lookbook Gallery (Uploaded Hero Model Photos) */}
      <section style={{ padding: 'var(--space-12) 0', backgroundColor: '#FFFFFF', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container-storefront">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
            <span style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-burgundy)', fontWeight: 600 }}>
              Atelier Campaign
            </span>
            <h2 style={{ marginTop: '6px' }}>The Autumn Lookbook</h2>
            <p style={{ maxWidth: '520px', margin: '8px auto 0', fontSize: '0.9rem' }}>
              Styled on real muses in natural ambient light. Discover how 18k gold vermeil and Mulberry silk drape in everyday movement.
            </p>
          </div>

          <div className="lookbook-grid">
            {lookbook.map((item) => (
              <Link key={item.id} href={item.link} className="lookbook-card">
                <div className="lookbook-card-media">
                  <PlaceholderImage src={item.image} alt={item.title} aspectRatio="4 / 5" priority />
                </div>
                <div className="lookbook-card-info">
                  <span style={{ fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-burgundy)', fontWeight: 600 }}>
                    {item.category}
                  </span>
                  <h4 className="lookbook-card-title">{item.title}</h4>
                  <p className="lookbook-card-sub">{item.subtitle}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial Craftsmanship & Philosophy Sanctuary */}
      <section className="philosophy-sanctuary-section" aria-label="The Philosophy of NISHKÈA">
        <div className="philosophy-sanctuary-bg-glow" aria-hidden="true" />
        
        <div className="container-storefront">
          <div className="philosophy-frame">
            {/* Architectural Gold Corner Motifs */}
            <span className="philosophy-corner philosophy-corner-tl" aria-hidden="true" />
            <span className="philosophy-corner philosophy-corner-tr" aria-hidden="true" />
            <span className="philosophy-corner philosophy-corner-bl" aria-hidden="true" />
            <span className="philosophy-corner philosophy-corner-br" aria-hidden="true" />

            {/* Poetic Philosophy Header */}
            <div className="philosophy-header">
              <div className="philosophy-ribbon">
                <span>✦</span>
                <span>MAISON FONDÉE 2024 • L&apos;ART DE LA JOAILLERIE</span>
                <span>✦</span>
              </div>
              <h2 className="philosophy-title">
                The Soul & <em>Philosophy</em> of NISHKÈA
              </h2>
              
              <div className="philosophy-quote-wrapper">
                <span className="philosophy-quote-mark" aria-hidden="true">“</span>
                <p className="philosophy-quote-text">
                  “Every jewel is an intimate dialogue between personal identity and timeless adornment. At NISHKÈA, luxury is not excess—it is the quiet perfection of proportion, the uncompromising purity of noble metals, and the devotion of master karigars who refuse haste.”
                </p>
              </div>

              {/* Founder's Motto & Brand Provenance Seal */}
              <div className="philosophy-signature-row">
                <span className="philosophy-badge-seal">
                  <Award size={13} /> BIS HALLMARKED ATELIER
                </span>
                <span className="philosophy-signature-script">
                  “It Suits You.”
                </span>
                <span className="philosophy-badge-seal">
                  <Sparkles size={13} /> 100% CONSCIOUS LUXURY
                </span>
              </div>
            </div>

            {/* 3 Pillars of Atelier Distinction */}
            <div className="philosophy-pillars-grid">
              {/* Pillar 1 */}
              <div className="philosophy-pillar-card">
                <div className="philosophy-pillar-icon-wrap">
                  <ShieldCheck size={22} />
                </div>
                <span className="philosophy-pillar-pre">Noble Metallurgy</span>
                <h3 className="philosophy-pillar-title">18K Vermeil & 925 Silver</h3>
                <p className="philosophy-pillar-desc">
                  Thick 2.5-micron layer of solid 18-karat gold over hypoallergenic 925 sterling silver. Every single design bears certified BIS hallmark assaying for authentic precious purity.
                </p>
                <div className="philosophy-pillar-tag">
                  <span>✦ Certified Nickel & Cadmium Free</span>
                </div>
              </div>

              {/* Pillar 2 */}
              <div className="philosophy-pillar-card">
                <div className="philosophy-pillar-icon-wrap">
                  <Gem size={22} />
                </div>
                <span className="philosophy-pillar-pre">Karigar Savoir-Faire</span>
                <h3 className="philosophy-pillar-title">Micro-Pavé Precision</h3>
                <p className="philosophy-pillar-desc">
                  Conflict-free AAA lab stones and natural gemstones hand-set under 40× magnification optical microscopes, ensuring maximum light refraction and heirloom prong security.
                </p>
                <div className="philosophy-pillar-tag">
                  <span>✦ 40× Optical Claw Calibration</span>
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="philosophy-pillar-card">
                <div className="philosophy-pillar-icon-wrap">
                  <RefreshCw size={22} />
                </div>
                <span className="philosophy-pillar-pre">Heirloom Endurance</span>
                <h3 className="philosophy-pillar-title">Anti-Tarnish Molecular Shield</h3>
                <p className="philosophy-pillar-desc">
                  Infused with an invisible nano-protective barrier engineered to resist humidity, heat, perfume, and everyday movement—preserving mirror radiance without dulling.
                </p>
                <div className="philosophy-pillar-tag">
                  <span>✦ Lifetime Atelier Care Program</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="philosophy-actions-row">
              <Link href="/shop" className="philosophy-cta-btn" id="philosophy-explore-atelier-btn">
                Explore The Atelier Catalog <ArrowRight size={14} />
              </Link>
              <Link href="/contact" className="philosophy-outline-btn" id="philosophy-concierge-btn">
                Consult With Atelier Concierge
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
