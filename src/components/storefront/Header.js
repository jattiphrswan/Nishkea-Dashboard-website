'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '../../context/StoreContext';
import { ShoppingBag, Heart, User, Menu, X } from 'lucide-react';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { cartCount, wishlistCount } = useStore();
  const pathname = usePathname();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navLinks = [
    { label: 'All Products', href: '/products' },
    { label: 'Shop', href: '/shop' },
    { label: 'Collections', href: '/shop?category=necklaces' },
    { label: 'About', href: '/shop#about' },
    { label: 'Contact', href: '/dashboard/login' }
  ];

  return (
    <header className="site-header">
      <div className="container-storefront" style={{ padding: 0 }}>
        <div className="header-grid-layout">
          {/* Left Navigation */}
          <nav className="header-panel-left" aria-label="Main Navigation">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`header-atelier-link ${pathname === link.href ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Brand Logo (Official NISHKÈA Logo) */}
          <div className="header-panel-center">
            <Link href="/" aria-label="NISHKÈA Home" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '180px', height: '46px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/brand/logo-white.svg"
                  alt="NISHKÈA — IT SUITS YOU !"
                  style={{ maxHeight: '44px', width: 'auto' }}
                />
              </div>
            </Link>
          </div>

          {/* Right Action Icons: Profile, Wishlist, Cart with Counter */}
          <div className="header-panel-right">
            <Link href="/dashboard/login" className="header-icon-link" title="Staff & Client Account" aria-label="Account">
              <User size={19} />
            </Link>

            <Link href="/wishlist" className="header-icon-link" title="Saved Pieces" aria-label="Wishlist">
              <Heart size={19} fill={wishlistCount > 0 ? 'var(--color-gold)' : 'none'} />
            </Link>

            <Link href="/cart" className="header-cart-box" title="Shopping Bag" aria-label="Shopping Bag">
              <ShoppingBag size={17} />
              <span>({cartCount > 0 ? cartCount : 7})</span>
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              className="btn-icon mobile-nav-toggle"
              style={{ color: '#FFFFFF', marginLeft: '8px' }}
              onClick={() => setMobileOpen(true)}
              aria-label="Open Navigation"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="drawer-overlay" onClick={() => setMobileOpen(false)}>
          <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ width: '150px' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/brand/logo.svg"
                  alt="NISHKÈA — IT SUITS YOU !"
                  style={{ width: '100%', height: 'auto' }}
                />
              </div>
              <button type="button" className="btn-icon" onClick={() => setMobileOpen(false)} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  style={{ fontSize: '1.05rem', fontWeight: 500, padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}
                >
                  {link.label}
                </Link>
              ))}
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link href="/products" onClick={() => setMobileOpen(false)} className="btn btn-primary" style={{ justifyContent: 'center' }}>
                  All Products & Gallery
                </Link>
                <Link href="/shop" onClick={() => setMobileOpen(false)} className="btn btn-outline" style={{ justifyContent: 'center' }}>
                  Explore All Jewellery
                </Link>
                <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="btn btn-outline btn-sm" style={{ justifyContent: 'center' }}>
                  Operations Dashboard
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
