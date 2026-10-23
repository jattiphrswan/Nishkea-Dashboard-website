'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '../../context/StoreContext';
import { ShoppingBag, Heart, User, Menu } from 'lucide-react';
import CategoryDrawer from './CategoryDrawer';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { cartCount, wishlistCount } = useStore();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 25);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const navLinks = [
    { label: 'All Products', href: '/products' },
    { label: 'Shop', href: '/shop' },
    { label: 'Collections', href: '/shop?category=necklaces' },
    { label: 'About', href: '/shop#about' },
    { label: 'Contact', href: '/contact' }
  ];

  // Homepage starts transparent floating over crimson silk hero; becomes luxury glassmorphic upon scroll.
  // Inner pages retain glassmorphism background for contrast over ivory page content.
  const isTransparent = pathname === '/' && !scrolled;

  return (
    <>
      <header
        className={`site-header ${isTransparent ? 'header-transparent' : 'header-scrolled-glass'}`}
        id="main-site-header"
      >
        <div className="container-storefront" style={{ padding: 0 }}>
          <div className="header-grid-layout">
            
            {/* Left Navigation with Menu Drawer Trigger */}
            <nav className="header-panel-left" aria-label="Main Navigation">
              <button
                type="button"
                className="header-menu-trigger"
                onClick={() => setDrawerOpen(true)}
                aria-label="Open Category Navigation Menu"
                id="header-desktop-drawer-btn"
                title="Explore Categories &amp; Festive Edits"
              >
                <Menu size={18} />
                <span>Categories</span>
              </button>

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

            {/* Brand Logo (Official NISHKÈA Logo in Authentic Brand Colors) */}
            <div className="header-panel-center">
              <Link href="/" aria-label="NISHKÈA Home" className="header-brand-link">
                <span className="header-brand-badge">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/brand/logo.png"
                    alt="NISHKÈA — IT SUITS YOU !"
                    className="header-brand-img"
                  />
                </span>
              </Link>
            </div>

            {/* Right Action Icons: Profile, Wishlist, Cart with Counter */}
            <div className="header-panel-right">
              <Link href="/account" className="header-icon-link" title="My Atelier Account & Orders" aria-label="Account">
                <User size={19} />
              </Link>

              <Link href="/wishlist" className="header-icon-link" title="Saved Pieces" aria-label="Wishlist">
                <Heart size={19} fill={wishlistCount > 0 ? 'var(--color-gold)' : 'none'} />
              </Link>

              <Link href="/cart" className="header-cart-box" title="Shopping Bag" aria-label="Shopping Bag">
                <ShoppingBag size={17} />
                <span>({cartCount > 0 ? cartCount : 7})</span>
              </Link>

              {/* Mobile Hamburger Drawer Trigger */}
              <button
                type="button"
                className="btn-icon mobile-nav-toggle"
                style={{ color: '#FFFFFF', marginLeft: '8px' }}
                onClick={() => setDrawerOpen(true)}
                aria-label="Open Navigation Drawer"
                id="header-mobile-drawer-btn"
              >
                <Menu size={22} />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Rubans-Style Luxury Sidebar Category Drawer */}
      <CategoryDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
}
