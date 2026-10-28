'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiSearch, FiChevronDown } from 'react-icons/fi';
import { Sparkles } from 'lucide-react';

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
            <div className="limitless-cta-eyebrow-wrap">
              <Sparkles size={13} className="limitless-eyebrow-icon" />
              <span className="limitless-cta-eyebrow">
                ATELIER CONCIERGE &bull; BESPOKE CURATION
              </span>
            </div>
            <h2 className="limitless-cta-title">
              Adorn without limit
            </h2>
            <p className="limitless-cta-sub">
              Find the right silhouette for your moment, handcrafted in minutes.
            </p>
          </div>

          {/* Right Column: Haute Joaillerie Concierge Dock */}
          <form className="limitless-cta-right" onSubmit={handleSearch}>
            <div className="limitless-glass-dock">
              {/* Silhouette Selection Field */}
              <div className="limitless-dock-field">
                <div className="limitless-dock-icon-halo">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="limitless-dock-icon"
                    aria-hidden="true"
                  >
                    <path d="M6 3h12l4 6-10 12L2 9l4-6z" />
                    <path d="M2 9h20" />
                    <path d="M10 3l2 6-2 12" />
                    <path d="M14 3l-2 6 2 12" />
                  </svg>
                </div>

                <div className="limitless-dock-content">
                  <label htmlFor="cta-silhouette-select" className="limitless-dock-label">
                    Your Silhouette
                  </label>
                  <div className="limitless-select-wrap">
                    <select
                      className="limitless-select-input"
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
                    <FiChevronDown className="limitless-select-chevron" size={14} aria-hidden="true" />
                  </div>
                </div>
              </div>

              {/* Architectural Hairline Divider */}
              <div className="limitless-dock-divider" aria-hidden="true" />

              {/* Radiant 18K Solid Gold Action Pill Button */}
              <button
                type="submit"
                id="cta-find-btn"
                className="limitless-action-btn"
                aria-label="Find Curated Silhouette Piece"
              >
                <span className="limitless-btn-shimmer" aria-hidden="true" />
                <span className="limitless-action-label">Find piece</span>
                <span className="limitless-btn-icon-bubble">
                  <FiSearch size={14} strokeWidth={2.4} />
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
