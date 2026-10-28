'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiSearch, FiChevronDown, FiCheck } from 'react-icons/fi';
import { Sparkles } from 'lucide-react';

const SILHOUETTES = [
  { value: 'necklaces', label: 'Necklaces & Pendants' },
  { value: 'earrings', label: 'Earrings & Jhumkas' },
  { value: 'rings', label: 'Solitaire & Cocktail Rings' },
  { value: 'bracelets', label: 'Bangles & Cuffs' },
  { value: 'accessories', label: 'Hair Adornments & Nose Rings' },
];

export default function BannerCTA() {
  const router = useRouter();
  const [category, setCategory] = useState('necklaces');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSelect = (val) => {
    setCategory(val);
    setIsOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(`/shop?category=${encodeURIComponent(category)}`);
  };

  const currentLabel = SILHOUETTES.find((s) => s.value === category)?.label || 'Select Silhouette';

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
            <div className="limitless-glass-dock" ref={dropdownRef}>
              {/* Silhouette Selection Field with Custom Luxury Dropdown */}
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
                  <span className="limitless-dock-label">Your Silhouette</span>

                  {/* Custom Luxury Dropdown Trigger */}
                  <button
                    type="button"
                    className={`atelier-dropdown-trigger ${isOpen ? 'active' : ''}`}
                    onClick={() => setIsOpen((prev) => !prev)}
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                    id="cta-silhouette-trigger"
                  >
                    <span className="atelier-dropdown-value">{currentLabel}</span>
                    <FiChevronDown
                      className={`atelier-dropdown-chevron ${isOpen ? 'open' : ''}`}
                      size={14}
                      aria-hidden="true"
                    />
                  </button>

                  {/* Floating Luxury Glass Menu */}
                  {isOpen && (
                    <div
                      className="atelier-dropdown-menu"
                      role="listbox"
                      aria-labelledby="cta-silhouette-trigger"
                    >
                      <div className="atelier-dropdown-header">
                        <span className="atelier-dropdown-header-text">Curated Silhouettes</span>
                      </div>
                      <div className="atelier-dropdown-list">
                        {SILHOUETTES.map((item) => {
                          const isSelected = item.value === category;
                          return (
                            <button
                              key={item.value}
                              type="button"
                              className={`atelier-dropdown-item ${isSelected ? 'selected' : ''}`}
                              onClick={() => handleSelect(item.value)}
                              role="option"
                              aria-selected={isSelected}
                            >
                              <span className="atelier-item-label">{item.label}</span>
                              {isSelected && (
                                <span className="atelier-item-check" aria-hidden="true">
                                  <FiCheck size={14} strokeWidth={2.6} />
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
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
