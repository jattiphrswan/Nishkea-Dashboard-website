'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FaInstagram, FaPinterestP, FaFacebookF, FaWhatsapp, FaYoutube } from 'react-icons/fa';
import { FiChevronRight } from 'react-icons/fi';

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      setSubscribed(true);
      setNewsletterEmail('');
    }
  };

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="container-storefront">
        <div className="footer-grid">
          {/* Brand Col */}
          <div className="footer-col">
            <h4
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.8rem',
                color: '#FAF7F2',
                letterSpacing: '0.12em',
                marginBottom: '10px'
              }}
            >
              NISHKÈA
            </h4>
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.8rem',
                color: 'var(--color-gold)',
                letterSpacing: '0.25em',
                marginBottom: '20px',
                fontWeight: 600
              }}
            >
              IT SUITS YOU !
            </p>
            <p style={{ fontSize: '0.86rem', color: '#B8ACB2', maxWidth: '340px', marginBottom: '24px' }}>
              Handcrafted fashion jewellery and refined accessories. Designed with classic artisanal silhouettes for modern styling.
            </p>

            {/* Newsletter form */}
            <form onSubmit={handleSubscribe} style={{ maxWidth: '340px' }}>
              <span style={{ fontSize: '0.78rem', color: '#FAF7F2', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                Receive New Edit Announcements
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#FFFFFF',
                    fontSize: '0.84rem',
                    borderRadius: '2px'
                  }}
                  aria-label="Email address for newsletter"
                />
                <button
                  type="submit"
                  className="btn btn-sm btn-primary"
                  style={{
                    padding: '4px 6px 4px 16px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>JOIN</span>
                  <span className="btn-icon-bubble" style={{ width: '22px', height: '22px' }}>
                    <FiChevronRight size={12} strokeWidth={2.5} />
                  </span>
                </button>
              </div>
              {subscribed && (
                <p style={{ fontSize: '0.75rem', color: 'var(--color-gold)', marginTop: '8px' }}>
                  Thank you for subscribing to our preview announcements.
                </p>
              )}
            </form>

            {/* Social Media Channels with react-icons */}
            <div style={{ marginTop: '22px' }}>
              <span style={{ fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-gold)', fontWeight: 600, display: 'block', marginBottom: '10px' }}>
                Follow The Maison
              </span>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Nishkea on Instagram" style={{ color: '#FAF7F2', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', textDecoration: 'none' }}>
                  <FaInstagram size={14} />
                </a>
                <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" aria-label="Nishkea on Pinterest" style={{ color: '#FAF7F2', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', textDecoration: 'none' }}>
                  <FaPinterestP size={14} />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Nishkea on Facebook" style={{ color: '#FAF7F2', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', textDecoration: 'none' }}>
                  <FaFacebookF size={14} />
                </a>
                <a href="https://wa.me" target="_blank" rel="noopener noreferrer" aria-label="Nishkea on WhatsApp" style={{ color: '#FAF7F2', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', textDecoration: 'none' }}>
                  <FaWhatsapp size={14} />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="Nishkea on YouTube" style={{ color: '#FAF7F2', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', textDecoration: 'none' }}>
                  <FaYoutube size={14} />
                </a>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="footer-col">
            <h5>Collections</h5>
            <ul className="footer-links">
              <li><Link href="/shop?category=earrings">Earrings (20+ Designs)</Link></li>
              <li><Link href="/shop?category=rings">Rings &amp; Bands</Link></li>
              <li><Link href="/shop?category=necklaces">Necklaces &amp; Pendants</Link></li>
              <li><Link href="/shop?category=hair-accessories">Hair Accessories</Link></li>
              <li><Link href="/shop?category=nose-rings">Nose Rings &amp; Naths</Link></li>
              <li><Link href="/shop">Browse All 159+ Assortment</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="footer-col">
            <h5>Client Care</h5>
            <ul className="footer-links">
              <li><Link href="/products/celeste-marquise-solitaire-band">Jewellery Care Guide</Link></li>
              <li><Link href="/products/celeste-marquise-solitaire-band">Ring Size Matrix</Link></li>
              <li><Link href="/cart">Complimentary Shipping</Link></li>
              <li><Link href="/cart">7-Day Return Policy</Link></li>
              <li><Link href="/wishlist">Saved Wishlist</Link></li>
              <li><Link href="/api/health">API Health Endpoint</Link></li>
            </ul>
          </div>

          {/* Company / Dashboard */}
          <div className="footer-col">
            <h5>Internal &amp; Governance</h5>
            <ul className="footer-links">
              <li>
                <Link href="/dashboard" style={{ color: 'var(--color-gold)' }}>
                  Company Dashboard (Staff)
                </Link>
              </li>
              <li><Link href="/dashboard">Inventory Ledger &amp; Batches</Link></li>
              <li><Link href="/dashboard">30-Day Collection Reviews</Link></li>
              <li><Link href="/dashboard">Purchases &amp; PO Records</Link></li>
              <li><Link href="/dashboard">CRM &amp; Daily Tasks</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p>© 2026 NISHKÈA. All rights reserved. Brand styling reference based on supplied artwork.</p>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span className="badge badge-demo">Node 2 Foundation Preview</span>
            <span style={{ fontSize: '0.74rem', color: '#887B82' }}>Fictional Fixture Catalogue</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
