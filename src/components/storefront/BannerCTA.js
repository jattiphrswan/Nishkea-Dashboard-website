'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiGlobe, FiSearch, FiChevronDown } from 'react-icons/fi';

export default function BannerCTA() {
  const router = useRouter();
  const [category, setCategory] = useState('necklaces');

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(`/shop?category=${encodeURIComponent(category)}`);
  };

  return (
    <section className="limitless-cta-section" aria-label="Explore Without Limit">
      <div className="limitless-cta-banner">
        {/* Background Editorial Panorama */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/editorial/cta-banner-bg.jpg"
          alt="Royal burgundy silk velvet draped with fine handcrafted jewellery and gold dust"
          className="limitless-cta-bg"
          loading="lazy"
        />

        {/* Deep Royal Burgundy & Gold Contrast Overlay */}
        <div className="limitless-cta-overlay" aria-hidden="true" />

        {/* Inner Content Grid constrained to container */}
        <div className="container-storefront limitless-cta-inner">
          {/* Left Column: Heading and Subtitle */}
          <div className="limitless-cta-left">
            <span className="limitless-cta-eyebrow">
              ATELIER CONCIERGE &bull; BESPOKE CURATION
            </span>
            <h2 className="limitless-cta-title">
              Adorn without limit
            </h2>
            <p className="limitless-cta-sub">
              Find the right silhouette for your moment, handcrafted in minutes.
            </p>
          </div>

          {/* Right Column: Frosted Glass Floating Dock */}
          <form className="limitless-cta-right" onSubmit={handleSearch}>
            <div className="limitless-glass-dock">
              {/* White Input Card */}
              <div className="limitless-input-card">
                <div className="limitless-input-header">
                  <FiGlobe size={15} style={{ color: 'var(--color-gold)' }} />
                  <span>Your Silhouette</span>
                </div>
                <div className="limitless-select-wrap">
                  <select
                    className="limitless-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    id="cta-silhouette-select"
                    aria-label="Select silhouette category"
                  >
                    <option value="necklaces">Necklaces & Pendants</option>
                    <option value="earrings">Earrings & Jhumkas</option>
                    <option value="rings">Solitaire & Cocktail Rings</option>
                    <option value="bracelets">Bangles & Cuffs</option>
                    <option value="accessories">Hair Adornments & Nose Rings</option>
                  </select>
                  <span className="limitless-chevron-btn" aria-hidden="true">
                    <FiChevronDown size={12} strokeWidth={2.5} />
                  </span>
                </div>
              </div>

              {/* Action Pill Button */}
              <button
                type="submit"
                className="limitless-action-btn"
                id="cta-find-btn"
                aria-label="Find category"
              >
                <span className="limitless-action-label">Find piece</span>
                <span className="limitless-action-icon">
                  <FiSearch size={20} strokeWidth={2.2} />
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

