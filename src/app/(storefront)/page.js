'use client';

import React from 'react';
import Link from 'next/link';
import { CATEGORIES, PRODUCTS, HERO_GALLERY } from '../../data/fixtures';
import ProductCard from '../../components/storefront/ProductCard';
import EditorialShowcase from '../../components/storefront/EditorialShowcase';
import AtelierWheelShowcase from '../../components/storefront/AtelierWheelShowcase';
import PlaceholderImage from '../../components/ui/PlaceholderImage';
import BannerCTA from '../../components/storefront/BannerCTA';
import BorderGlow from '../../components/ui/BorderGlow';
import StarBorder from '../../components/ui/StarBorder';
import ScrollReveal from '../../components/ui/ScrollReveal';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { FaGem, FaSyncAlt, FaShieldAlt } from 'react-icons/fa';

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
            <StarBorder
              as={Link}
              href="/shop"
              color="#ffffff"
              trailColor="#ffffff"
              duration={4}
              direction="clockwise"
              stars={1}
              trailLength={0.3}
              thickness={1.2}
              radius={9999}
              glow={0.65}
              hover="lap"
              sparkle={false}
              clickPulse
              theme="dark"
              backgroundColor="rgba(12, 12, 15, 0.9)"
              className="hero-ref-btn"
              id="hero-discover-btn"
            >
              <span>BEGIN EXPERIENCE</span>
              <span className="btn-icon-bubble">
                <ChevronRight size={15} strokeWidth={2.5} />
              </span>
            </StarBorder>
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
      <ScrollReveal direction="up" threshold={0.1}>
        <section style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--color-border)', padding: '20px 0' }}>
          <div className="container-storefront">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', textAlign: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <FaGem size={20} color="var(--color-burgundy)" />
                <strong style={{ fontSize: '0.82rem', letterSpacing: '0.06em' }}>159+ ATELIER DESIGNS</strong>
                <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>Solid 18K vermeil, silk and fine stones</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <FaSyncAlt size={19} color="var(--color-burgundy)" />
                <strong style={{ fontSize: '0.82rem', letterSpacing: '0.06em' }}>30-DAY TREND CYCLES</strong>
                <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>Curated monthly capsule edits</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <FaShieldAlt size={20} color="var(--color-burgundy)" />
                <strong style={{ fontSize: '0.82rem', letterSpacing: '0.06em' }}>TRANSACTIONAL LEDGER</strong>
                <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>Live inventory with zero overselling</span>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Luxury Editorial Showcase (Reference Style Bento Grid) */}
      <ScrollReveal direction="up" threshold={0.1}>
        <EditorialShowcase />
      </ScrollReveal>

      {/* 3D Interactive OptionWheel Showcase Section */}
      <ScrollReveal direction="up" threshold={0.1}>
        <AtelierWheelShowcase />
      </ScrollReveal>

      {/* Core Categories with Dynamic BorderGlow */}
      <ScrollReveal direction="up" threshold={0.1}>
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
                <BorderGlow
                  as={Link}
                  key={cat.id}
                  href={`/shop?category=${cat.slug}`}
                  className="category-tile"
                  edgeSensitivity={26}
                  glowColor="40 80 80"
                  backgroundColor="#FFFFFF"
                  borderRadius={18}
                  glowRadius={36}
                  glowIntensity={1}
                  coneSpread={25}
                  animated={false}
                  colors={['#D4AF37', '#781D39', '#C084FC', '#F472B6', '#38BDF8']}
                  fillOpacity={0.15}
                >
                  <div className="category-tile-media">
                    <PlaceholderImage src={cat.image} alt={cat.name} category={cat.name} />
                  </div>
                  <div className="category-tile-info">
                    <h3 className="category-tile-title">{cat.name}</h3>
                    <span className="category-tile-count">{cat.estimatedDesigns}</span>
                  </div>
                </BorderGlow>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Featured Pieces */}
      <ScrollReveal direction="up" threshold={0.1}>
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
                <span>VIEW ALL</span>
                <span className="btn-icon-bubble">
                  <ChevronRight size={12} strokeWidth={2.5} />
                </span>
              </Link>
            </div>

            <div className="product-grid">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Atelier Lookbook Gallery (Uploaded Hero Model Photos) */}
      <ScrollReveal direction="up" threshold={0.1}>
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
      </ScrollReveal>

      {/* Limitless Adornment Luxury Capsule CTA Banner (Reference Match) */}
      <ScrollReveal direction="scale" threshold={0.1}>
        <BannerCTA />
      </ScrollReveal>
    </div>
  );
}
