'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '../../context/StoreContext';
import { ShoppingBag, Heart, Search, Menu, X, ShieldAlert } from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cartCount, wishlistCount } = useStore();
  const pathname = usePathname();

  // Close mobile drawer on route transition
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Handle Escape key to close mobile drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: 'Shop All', href: '/shop' },
    { label: 'Earrings', href: '/shop?category=earrings' },
    { label: 'Rings', href: '/shop?category=rings' },
    { label: 'Necklaces', href: '/shop?category=necklaces' },
    { label: 'Hair', href: '/shop?category=hair-accessories' },
    { label: 'Nose Rings', href: '/shop?category=nose-rings' }
  ];

  return (
    <>
      {/* Announcement Bar */}
      <div className="announcement-bar" role="region" aria-label="Store announcement">
        <span>
          <span style={{ color: 'var(--color-gold)' }}>✦</span>
          <span>COMPLIMENTARY SHIPPING OVER ₹3,000 • NODE 2 PREVIEW</span>
          <span style={{ color: 'var(--color-gold)' }}>✦</span>
        </span>
      </div>

      {/* Main Header */}
      <header className="site-header">
        <div className="container-storefront">
          <div className="header-inner">
            {/* Mobile Nav Toggle */}
            <button
              type="button"
              className="mobile-nav-toggle btn-icon"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open mobile navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <Menu size={22} />
            </button>

            {/* Brand Logo */}
            <div className="header-brand">
              <Link href="/" aria-label="NISHKÈA Home">
                <div style={{ width: '180px', height: '45px', display: 'flex', alignItems: 'center' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/brand/logo.svg"
                    alt="NISHKÈA — IT SUITS YOU !"
                    style={{ height: '42px', width: 'auto' }}
                  />
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="header-nav" aria-label="Main Navigation">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`header-nav-link ${isActive ? 'active' : ''}`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Action Icons */}
            <div className="header-actions">
              <Link
                href="/shop"
                className="btn-icon"
                aria-label="Search catalogue"
                title="Search catalogue"
              >
                <Search size={20} />
              </Link>

              <Link
                href="/wishlist"
                className="btn-icon cart-indicator"
                aria-label={`Wishlist (${wishlistCount} items)`}
                title="Wishlist"
              >
                <Heart size={20} />
                {wishlistCount > 0 && <span className="cart-count">{wishlistCount}</span>}
              </Link>

              <Link
                href="/cart"
                className="btn-icon cart-indicator"
                aria-label={`Shopping Bag (${cartCount} items)`}
                title="Shopping Bag"
              >
                <ShoppingBag size={20} />
                {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
              </Link>

              <Link
                href="/dashboard"
                className="btn btn-outline btn-sm"
                style={{ marginLeft: '6px', fontSize: '0.72rem', display: 'none' }}
                id="staff-dashboard-btn"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard"
                className="badge badge-demo"
                style={{ marginLeft: '4px', textDecoration: 'none' }}
                title="Company Dashboard (Staff Preview)"
              >
                Staff
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          className="drawer-overlay"
          onClick={() => setMobileMenuOpen(false)}
          role="presentation"
        >
          <div
            className="drawer-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
              <div style={{ width: '130px' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/brand/logo.svg" alt="NISHKÈA" style={{ width: '100%', height: 'auto' }} />
              </div>
              <button
                type="button"
                className="btn-icon"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
              >
                <X size={22} />
              </button>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    padding: '8px 0',
                    borderBottom: '1px solid var(--color-border-subtle)',
                    color: 'var(--color-text-main)'
                  }}
                >
                  {link.label}
                </Link>
              ))}

              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '2px solid var(--color-border)' }}>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Staff Dashboard Preview
                </Link>
              </div>
            </nav>

            <div style={{ marginTop: 'auto', paddingTop: '24px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#8C5311', marginBottom: '6px' }}>
                <ShieldAlert size={14} />
                <strong>Node 2 Foundation Mode</strong>
              </div>
              <span>Jewellery and accessories demo storefront. No real checkout or payment account connected.</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
