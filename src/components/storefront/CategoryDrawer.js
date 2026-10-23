'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  ChevronRight,
  MapPin,
  PackageCheck,
  PhoneCall,
  RotateCcw,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

const DEMI_FINE_CATEGORIES = [
  {
    name: 'Combo Sets',
    styles: '30 styles',
    href: '/shop?category=necklaces&tag=combo',
    image: '/images/prodcuts/neackless-4.png'
  },
  {
    name: 'Bracelet & Cuffs',
    styles: '53 styles',
    href: '/shop?category=necklaces&tag=bracelet',
    image: '/images/prodcuts/ring-2.png'
  },
  {
    name: 'Necklace and Chains',
    styles: '190 styles',
    href: '/shop?category=necklaces',
    image: '/images/prodcuts/neackless-1.png'
  },
  {
    name: 'Earrings & Drops',
    styles: '114 styles',
    href: '/shop?category=earrings',
    image: '/images/prodcuts/earring 1.png'
  },
  {
    name: 'Rings & Bands',
    styles: '61 styles',
    href: '/shop?category=rings',
    image: '/images/prodcuts/ring-1.png'
  },
  {
    name: 'Hair Accessories & Anklets',
    styles: '36 styles',
    href: '/shop?category=hair-accessories',
    image: '/images/prodcuts/hearband-1.png'
  }
];

const ETHNIC_CATEGORIES = [
  {
    name: 'Heritage Chokers & Necklaces',
    styles: '85 styles',
    href: '/shop?category=necklaces&tag=ethnic',
    image: '/images/prodcuts/neakless-2.png'
  },
  {
    name: 'Chandbalis & Jhumkas',
    styles: '95 styles',
    href: '/shop?category=earrings&tag=jhumka',
    image: '/images/prodcuts/Gold Hoops on Oxblood Silk.png'
  },
  {
    name: 'Bridal Combo Sets',
    styles: '42 styles',
    href: '/shop?category=necklaces&tag=bridal',
    image: '/images/prodcuts/neackless-3.png'
  },
  {
    name: 'Kundan & Temple Rings',
    styles: '38 styles',
    href: '/shop?category=rings&tag=temple',
    image: '/images/prodcuts/ring-3.png'
  },
  {
    name: 'Maharashtrian Nath & Pins',
    styles: '40 styles',
    href: '/shop?category=nose-rings',
    image: '/images/hero/10.png'
  },
  {
    name: 'Festive Cuffs & Bangles',
    styles: '29 styles',
    href: '/shop?category=necklaces&tag=bangles',
    image: '/images/prodcuts/ring-4.png'
  }
];

const DISCOVER_TILES = [
  {
    label: 'American Diamond',
    href: '/shop?collection=monthly_trend&tag=diamond',
    image: '/images/hero/4.png'
  },
  {
    label: 'Temple',
    href: '/shop?category=necklaces&tag=temple',
    image: '/images/hero/2.png'
  },
  {
    label: 'Oxidised',
    href: '/shop?category=earrings&tag=oxidised',
    image: '/images/hero/3.png'
  },
  {
    label: 'Western',
    href: '/shop?category=necklaces&tag=western',
    image: '/images/hero/1.png'
  }
];

export default function CategoryDrawer({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('demi-fine');

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock background scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentCategories = activeTab === 'demi-fine' ? DEMI_FINE_CATEGORIES : ETHNIC_CATEGORIES;

  return (
    <div className="cat-drawer-backdrop" onClick={onClose} aria-modal="true" role="dialog">
      <div
        className="cat-drawer-panel"
        onClick={(e) => e.stopPropagation()}
        aria-label="Category Navigation Menu"
      >
        {/* Top Header Bar with Brand & Close Button */}
        <div className="cat-drawer-header">
          <Link href="/" onClick={onClose} className="cat-drawer-brand" aria-label="NISHKÈA Atelier Home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/brand/logo.png"
              alt="NISHKÈA — IT SUITS YOU !"
              style={{ height: '32px', width: 'auto', display: 'block', objectFit: 'contain' }}
            />
          </Link>
          <button
            type="button"
            className="cat-drawer-close-btn"
            onClick={onClose}
            aria-label="Close Navigation Drawer"
            id="cat-drawer-close-btn"
          >
            <X size={22} />
          </button>
        </div>

        {/* Segmented Category Filter Tabs (Demi Fine | Ethnic) */}
        <div className="cat-drawer-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'demi-fine'}
            className={`cat-drawer-tab ${activeTab === 'demi-fine' ? 'active' : ''}`}
            onClick={() => setActiveTab('demi-fine')}
          >
            <span>Demi Fine</span>
          </button>
          <div className="cat-tab-divider" aria-hidden="true" />
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'ethnic'}
            className={`cat-drawer-tab ${activeTab === 'ethnic' ? 'active' : ''}`}
            onClick={() => setActiveTab('ethnic')}
          >
            <span>Ethnic</span>
          </button>
        </div>

        {/* Scrollable Drawer Content */}
        <div className="cat-drawer-body">
          
          {/* Shop By Category List */}
          <section className="cat-drawer-section">
            <h3 className="cat-section-title">Shop By Category</h3>
            <div className="cat-category-list">
              {currentCategories.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className="cat-category-row"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="cat-category-thumb"
                    loading="lazy"
                  />
                  <div className="cat-category-meta">
                    <span className="cat-category-name">{item.name}</span>
                    <span className="cat-category-styles">{item.styles}</span>
                  </div>
                  <ChevronRight size={16} className="cat-chevron-icon" />
                </Link>
              ))}
            </div>
          </section>

          {/* Discover Section (4-Tile Visual Grid) */}
          <section className="cat-drawer-section cat-discover-section">
            <h3 className="cat-section-title">Discover</h3>
            <div className="cat-discover-grid">
              {DISCOVER_TILES.map((tile) => (
                <Link
                  key={tile.label}
                  href={tile.href}
                  onClick={onClose}
                  className="cat-discover-card"
                >
                  <div className="cat-discover-media">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={tile.image}
                      alt={tile.label}
                      className="cat-discover-img"
                      loading="lazy"
                    />
                  </div>
                  <span className="cat-discover-label">{tile.label}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* Quick Utility / Help Links Footer */}
          <section className="cat-drawer-section cat-utility-section">
            <Link href="/contact#stores" onClick={onClose} className="cat-utility-link">
              <MapPin size={18} className="cat-util-icon" />
              <span>Store Locator</span>
            </Link>
            <Link href="/account" onClick={onClose} className="cat-utility-link">
              <PackageCheck size={18} className="cat-util-icon" />
              <span>Track Package</span>
            </Link>
            <Link href="/contact" onClick={onClose} className="cat-utility-link">
              <PhoneCall size={18} className="cat-util-icon" />
              <span>Contact Us</span>
            </Link>
            <Link href="/contact#faq" onClick={onClose} className="cat-utility-link">
              <RotateCcw size={18} className="cat-util-icon" />
              <span>Return &amp; Exchange Policy</span>
            </Link>
            <Link href="/dashboard" onClick={onClose} className="cat-utility-link cat-util-staff">
              <ShieldCheck size={18} className="cat-util-icon" />
              <span>Atelier Operations Dashboard</span>
            </Link>
          </section>

        </div>
      </div>
    </div>
  );
}
