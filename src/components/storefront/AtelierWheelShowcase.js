'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import OptionWheel from '../ui/OptionWheel';
import StarBorder from '../ui/StarBorder';
import { ArrowRight, Sparkles, Compass, ShieldCheck } from 'lucide-react';

const AURA_ITEMS = [
  {
    name: 'Royal Heritage',
    category: 'Polki & Kundan',
    tagline: 'Imperial Polki & 22K Antique Gold',
    description: 'Handcrafted un-cut polki crystals set in pure 22K gold vermeil with emerald bead drops, reminiscent of Rajasthan\'s royal courts.',
    image: '/images/prodcuts/neackless-1.png',
    hallmark: '22K Solid Vermeil • Certified Raw Polki',
    price: 'From ₹4,890',
    link: '/shop?category=necklaces'
  },
  {
    name: 'Moonlit Sapphires',
    category: 'Fine Silver Edit',
    tagline: '925 Sterling Silver & Blue Sapphire Suite',
    description: 'Deep midnight sapphire stones prong-set in rhodium-finished 925 sterling silver, catching ambient starlight with every movement.',
    image: '/images/editorial/bento-silver-campaign.jpg',
    hallmark: '925 Silver Hallmark • Lab Sapphire',
    price: 'From ₹3,490',
    link: '/shop?category=earrings'
  },
  {
    name: 'Demi-Fine Solitaire',
    category: 'Minimalist Rings',
    tagline: 'Modern Solitaires & Architectural Bands',
    description: 'Architectural purity for everyday elegance. Precision-faceted solitaires mounted on 18K gold bands designed to stack effortlessly.',
    image: '/images/prodcuts/ring-1.png',
    hallmark: '18K Gold • VVS Moissanite Solitaire',
    price: 'From ₹2,190',
    link: '/shop?category=rings'
  },
  {
    name: 'Temple Kundan',
    category: 'Sacred Adornments',
    tagline: 'Heritage Meenakari & Sacred Lotus Chokers',
    description: 'Intricate lac-filled kundan work with red and green meenakari enamel on the reverse, blessed by Jaipur guild masters.',
    image: '/images/prodcuts/neackless-3.png',
    hallmark: 'Traditional Jadau • Enamel Reverse',
    price: 'From ₹5,990',
    link: '/shop?category=necklaces'
  },
  {
    name: 'Artisanal Filigree',
    category: 'Chandelier Drops',
    tagline: 'Featherlight 18K Gold Wirework Drops',
    description: 'Microscopic gold wire twisted by hand into celestial lace geometry. Weighs virtually nothing yet commands every room.',
    image: '/images/prodcuts/earring 1.png',
    hallmark: '18K Gold Vermeil • Hand-twisted Wire',
    price: 'From ₹1,890',
    link: '/shop?category=earrings'
  },
  {
    name: 'Festive Statement',
    category: 'Pavé Diamonds',
    tagline: 'Pavé Diamond Bangles & Layered Curbs',
    description: 'High-voltage glamour. Densely pavé-set crystals and bold architectural curb chains reflecting festival lights from every angle.',
    image: '/images/editorial/bento-diamond-trendsetters.jpg',
    hallmark: 'Pavé Setting • Dual Safety Clasp',
    price: 'From ₹6,450',
    link: '/shop?collection=monthly_trend'
  },
  {
    name: 'Rose Gold Romance',
    category: 'Silk & Flora',
    tagline: 'Blush Pink Morganite & Petal Motifs',
    description: 'Soft rose-gold tones with blush morganite stones and sculpted petal contours that warm every skin undertone.',
    image: '/images/prodcuts/hearband-1.png',
    hallmark: 'Rose Gold Plating • Mulberry Silk Base',
    price: 'From ₹2,750',
    link: '/shop?category=accessories'
  },
  {
    name: 'Modern Minimalist',
    category: 'Daily Luxe',
    tagline: 'Everyday Huggie Hoops & Fluid Cuffs',
    description: 'Refined daily adornment engineered for effortless comfort. Waterproof, sweat-proof, and tarnish-resistant.',
    image: '/images/prodcuts/ring-2.png',
    hallmark: 'Hypoallergenic Titanium • 18K PVD Finish',
    price: 'From ₹1,490',
    link: '/shop?category=rings'
  }
];

export default function AtelierWheelShowcase() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const activeAura = AURA_ITEMS[selectedIndex] || AURA_ITEMS[0];

  return (
    <section className="atelier-wheel-section" aria-label="Atelier Mood Selector">
      {/* Ambient Silk Velvet Background Glow */}
      <div className="atelier-wheel-ambient" aria-hidden="true" />

      <div className="container-storefront atelier-wheel-container">
        {/* Section Header */}
        <div className="atelier-wheel-header">
          <div className="atelier-wheel-eyebrow">
            <Sparkles size={14} className="eyebrow-sparkle" />
            <span>3D INTERACTIVE ATELIER CURATOR</span>
            <Sparkles size={14} className="eyebrow-sparkle" />
          </div>
          <h2 className="atelier-wheel-title">
            Select Your Aesthetic Aura
          </h2>
          <p className="atelier-wheel-sub">
            Spin the curved 3D option wheel with scroll, drag, or arrow keys to tilt options and explore bespoke high-jewellery edits.
          </p>
        </div>

        {/* 2-Column Wheel & Spotlight Showcase */}
        <div className="atelier-wheel-grid">
          {/* Left Column: 3D OptionWheel */}
          <div className="atelier-wheel-picker-wrap">
            <div className="atelier-wheel-picker-frame">
              <div className="atelier-wheel-active-indicator" aria-hidden="true" />
              <OptionWheel
                items={AURA_ITEMS.map((item) => item.name)}
                defaultSelected={0}
                onChange={(idx) => setSelectedIndex(idx)}
                side="left"
                fontSize={2.5}
                spacing={1.35}
                curve={1.2}
                tilt={7.5}
                blur={2.4}
                fade={0.3}
                minOpacity={0.08}
                smoothing={180}
                inset={44}
                textColor="rgba(250, 247, 242, 0.42)"
                activeColor="#FAF7F2"
              />
            </div>
            <div className="atelier-wheel-hint">
              <Compass size={13} />
              <span>Scroll wheel, drag up/down, or use arrow keys to spin</span>
            </div>
          </div>

          {/* Right Column: Dynamic Spotlight Card */}
          <div className="atelier-wheel-spotlight">
            <div className="spotlight-card">
              {/* Media Container with Subtle Parallax Zoom */}
              <div className="spotlight-media-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={activeAura.image}
                  src={activeAura.image}
                  alt={activeAura.tagline}
                  className="spotlight-img animate-fade-in"
                  loading="lazy"
                />
                <div className="spotlight-media-overlay" />
                <span className="spotlight-badge">
                  {activeAura.category}
                </span>
                <span className="spotlight-price">
                  {activeAura.price}
                </span>
              </div>

              {/* Information & Action Content */}
              <div className="spotlight-content">
                <div className="spotlight-hallmark">
                  <ShieldCheck size={14} style={{ color: 'var(--color-gold)' }} />
                  <span>{activeAura.hallmark}</span>
                </div>

                <h3 className="spotlight-heading">
                  {activeAura.tagline}
                </h3>

                <p className="spotlight-desc">
                  {activeAura.description}
                </p>

                {/* Animated StarBorder Action Buttons */}
                <div className="spotlight-actions">
                  <StarBorder
                    as={Link}
                    href={activeAura.link}
                    color="#ffffff"
                    trailColor="#ffffff"
                    duration={4}
                    direction="clockwise"
                    stars={1}
                    trailLength={0.3}
                    thickness={1}
                    radius={12}
                    glow={0.6}
                    hover="lap"
                    sparkle={false}
                    clickPulse
                    theme="dark"
                    className="spotlight-star-btn"
                  >
                    <span>Get started</span>
                    <ArrowRight size={15} />
                  </StarBorder>

                  <StarBorder
                    as={Link}
                    href={activeAura.link}
                    color="#E6C875"
                    trailColor="#C5A059"
                    duration={3.5}
                    direction="clockwise"
                    stars={2}
                    trailLength={0.35}
                    thickness={1.5}
                    radius={12}
                    glow={0.8}
                    hover="brighten"
                    sparkle={true}
                    clickPulse
                    theme="gold"
                    className="spotlight-star-btn-gold"
                  >
                    <span>Explore {activeAura.name}</span>
                    <Sparkles size={14} />
                  </StarBorder>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
