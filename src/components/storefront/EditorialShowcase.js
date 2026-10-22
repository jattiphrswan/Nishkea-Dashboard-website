'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Sparkles } from 'lucide-react';

export default function EditorialShowcase() {
  return (
    <section className="editorial-showcase-section" aria-label="Festive Editorial Highlights">
      <div className="container-storefront">
        <div className="editorial-bento-grid">
          
          {/* Card 1: Left Hero Portrait (Silver & Sapphire Campaign) */}
          <Link
            href="/shop?category=necklaces"
            className="editorial-card editorial-card-hero"
            id="editorial-card-silver"
            aria-label="SHIKHAR by NISHKÈA - Crafted in 925 Silver with Flat 40% Off"
          >
            {/* Background Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/editorial/bento-silver-campaign.jpg"
              alt="Model wearing handcrafted 925 sterling silver and blue sapphire necklace and matching cuffs"
              className="editorial-card-bg"
              loading="eager"
            />
            
            {/* Top Brand & Hallmark Row */}
            <div className="editorial-card-top">
              <div className="editorial-brand-mark">
                <span className="editorial-brand-name">SHIKHAR</span>
                <span className="editorial-brand-sub">by NISHKÈA</span>
              </div>
              <div className="editorial-hallmark-badge">
                <span className="hallmark-pre">Crafted in</span>
                <span className="hallmark-title">925 Silver</span>
              </div>
            </div>

            {/* Bottom Promotional Callout */}
            <div className="editorial-card-bottom-hero">
              <div className="editorial-offer-callout">
                <span className="offer-label">FLAT</span>
                <div className="offer-val-row">
                  <span className="offer-highlight">40% OFF</span>
                </div>
              </div>
              <span className="editorial-cta-pill">
                Explore Silver Edit <ArrowUpRight size={15} />
              </span>
            </div>
          </Link>

          {/* Right Column (2-Rows) */}
          <div className="editorial-bento-col">
            
            {/* Card 2: Plain Gold Designs */}
            <Link
              href="/shop?category=earrings"
              className="editorial-card editorial-card-landscape editorial-card-gold"
              id="editorial-card-gold"
              aria-label="Plain Gold Designs - New and Most-Loved Styles for the Festive Season"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/editorial/bento-gold-curation.jpg"
                alt="22K Plain Gold Curb Chain and Lotus Filigree Studs on Velvet"
                className="editorial-card-bg"
                loading="lazy"
              />
              <div className="editorial-card-scrim scrim-gold" />
              <div className="editorial-card-content">
                <span className="editorial-card-eyebrow">
                  <Sparkles size={13} /> Festive Collection
                </span>
                <h3 className="editorial-card-title">Plain Gold Designs</h3>
                <p className="editorial-card-desc">
                  New &amp; Most-Loved Styles for the Festive Season
                </p>
                <div className="editorial-inline-action">
                  <span>Shop Gold Curation</span>
                  <ArrowUpRight size={16} />
                </div>
              </div>
            </Link>

            {/* Card 3: Thursday Trendsetters Pavé Diamonds */}
            <Link
              href="/shop?collection=monthly_trend"
              className="editorial-card editorial-card-landscape editorial-card-trendsetters"
              id="editorial-card-diamonds"
              aria-label="Thursday Trendsetters - Pavé set diamonds that sparkle from every angle"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/editorial/bento-diamond-trendsetters.jpg"
                alt="Pavé set diamond bangles and open cuffs on architectural velvet pedestals"
                className="editorial-card-bg"
                loading="lazy"
              />
              <div className="editorial-card-scrim scrim-diamonds" />
              <div className="editorial-card-content">
                <h3 className="editorial-card-title trendsetter-title">
                  Thursday <span className="trendsetter-serif-italic">trendsetters</span>
                </h3>
                <p className="editorial-card-desc">
                  <em>Pavé set diamonds</em> that sparkle from every angle.
                </p>
                <div className="editorial-inline-action">
                  <span>View Diamond Trendsetters</span>
                  <ArrowUpRight size={16} />
                </div>
              </div>
            </Link>

          </div>
        </div>
      </div>
    </section>
  );
}
