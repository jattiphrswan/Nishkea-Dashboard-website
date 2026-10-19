'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PRODUCTS } from '../../../../data/fixtures';
import { useStore } from '../../../../context/StoreContext';
import { formatCurrency, computeAvailableStock } from '../../../../lib/formatters';
import PlaceholderImage from '../../../../components/ui/PlaceholderImage';
import ProductCard from '../../../../components/storefront/ProductCard';
import {
  ShoppingBag,
  Heart,
  ShieldAlert,
  ChevronRight,
  Info,
  Sparkles,
  ArrowLeft,
  Truck,
  RotateCcw
} from 'lucide-react';

export default function ProductDetailPage({ params }) {
  // Unwrap Next.js dynamic route params
  const resolvedParams = use(params);
  const slug = resolvedParams?.slug;

  const product = PRODUCTS.find((p) => p.slug === slug);
  const { addToCart, toggleWishlist, isInWishlist } = useStore();

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="container-storefront" style={{ padding: '80px 16px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>Design Not Found</h2>
        <p style={{ maxWidth: '440px', margin: '0 auto 24px' }}>
          The requested jewellery item does not exist or has been archived from our catalogue.
        </p>
        <Link href="/shop" className="btn btn-primary">
          <ArrowLeft size={16} /> Return to Catalogue
        </Link>
      </div>
    );
  }

  const currentVariant = product.variants[selectedVariantIndex] || product.variants[0];
  const isWishlisted = isInWishlist(product.id);
  const relatedProducts = PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 3);
  const activeImage = product.images[selectedImageIndex] || product.images[0];

  const availableUnits = computeAvailableStock(currentVariant.sellable, currentVariant.reserved);

  return (
    <div style={{ padding: 'var(--space-6) 0 var(--space-16)' }}>
      <div className="container-storefront">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.78rem',
            color: 'var(--color-text-muted)',
            marginBottom: 'var(--space-6)'
          }}
        >
          <Link href="/">Home</Link>
          <ChevronRight size={13} />
          <Link href="/shop">Shop</Link>
          <ChevronRight size={13} />
          <Link href={`/shop?category=${product.category}`}>{product.categoryName}</Link>
          <ChevronRight size={13} />
          <span style={{ color: 'var(--color-text-main)', fontWeight: 600 }}>{product.name}</span>
        </nav>

        {/* Fictional Fixture Notice Banner */}
        <div
          role="note"
          style={{
            backgroundColor: '#FEF7EC',
            border: '1px solid #F5DEB3',
            borderRadius: 'var(--radius-xs)',
            padding: '10px 16px',
            marginBottom: 'var(--space-8)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.8rem',
            color: '#8C5311'
          }}
        >
          <ShieldAlert size={18} style={{ flexShrink: 0 }} />
          <div>
            <strong>Node 2 Architectural Foundation:</strong> Product specifications, pricing, and variant availability are fictional fixtures for UI preview. No live payment gateway or warehouse counter is connected.
          </div>
        </div>

        {/* Product Showcase Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 'var(--space-10)',
            marginBottom: 'var(--space-16)'
          }}
          className="product-detail-grid"
        >
          <style jsx>{`
            @media (min-width: 900px) {
              .product-detail-grid {
                grid-template-columns: 1fr 1fr !important;
              }
            }
          `}</style>

          {/* Left Column: Image Gallery */}
          <div>
            <div style={{ marginBottom: '16px', borderRadius: 'var(--radius-xs)', overflow: 'hidden' }}>
              <PlaceholderImage
                src={activeImage?.url}
                alt={activeImage?.alt || product.name}
                aspectRatio="1 / 1"
                priority={true}
                category={product.categoryName}
              />
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div style={{ display: 'flex', gap: '10px' }}>
                {product.images.map((img, idx) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    style={{
                      width: '74px',
                      height: '74px',
                      padding: 0,
                      border: selectedImageIndex === idx ? '2px solid var(--color-burgundy)' : '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-xs)',
                      background: 'none',
                      cursor: 'pointer',
                      overflow: 'hidden'
                    }}
                    aria-label={`View ${img.alt || `Product image ${idx + 1}`}`}
                  >
                    <PlaceholderImage src={img.url} alt="" aspectRatio="1 / 1" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Information & Controls */}
          <div>
            {/* Badges */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <span className="badge badge-burgundy">{product.categoryName}</span>
              <span className="badge badge-gold">{product.collectionName}</span>
              {product.lifecycle === 'under_review' && (
                <span className="badge badge-warning">30-Day Review Pending</span>
              )}
              {product.lifecycle === 'clearance' && (
                <span className="badge badge-danger">Clearance</span>
              )}
            </div>

            {/* Title & Code */}
            <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', marginBottom: '8px', lineHeight: 1.2 }}>
              {product.name}
            </h1>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
              Design Code: <strong>{product.code}</strong> • SKU: <strong>{currentVariant.sku}</strong>
            </div>

            {/* Price & Unit */}
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '12px',
                marginBottom: '24px',
                paddingBottom: '16px',
                borderBottom: '1px solid var(--color-border)'
              }}
            >
              <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-burgundy)' }}>
                {formatCurrency(product.priceMinor, product.currency)}
              </span>
              <span style={{ fontSize: '0.86rem', color: 'var(--color-text-muted)' }}>
                {product.salesUnit === 'pair'
                  ? 'Sold as Pair'
                  : product.salesUnit === 'set'
                  ? 'Complete Set'
                  : 'Sold per Piece'}
              </span>
            </div>

            {/* Description */}
            <p style={{ fontSize: '0.94rem', lineHeight: 1.7, marginBottom: '24px', color: 'var(--color-text-main)' }}>
              {product.description}
            </p>

            {/* Variant Selector */}
            {product.variants.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                  Option Combination: <span style={{ color: 'var(--color-burgundy)' }}>{currentVariant.colour} {currentVariant.size ? `— ${currentVariant.size}` : ''}</span>
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {product.variants.map((v, idx) => (
                    <button
                      key={v.sku}
                      type="button"
                      onClick={() => setSelectedVariantIndex(idx)}
                      className={`btn btn-sm ${selectedVariantIndex === idx ? 'btn-primary' : 'btn-outline'}`}
                      style={{ borderRadius: 'var(--radius-xs)', fontSize: '0.78rem' }}
                    >
                      {v.colour} {v.size ? `(${v.size})` : ''}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock Availability Indicator (Transactional Rule Simulation) */}
            <div style={{ marginBottom: '24px', fontSize: '0.8rem' }}>
              <span style={{ color: availableUnits > 0 ? 'var(--color-status-success)' : 'var(--color-status-danger)', fontWeight: 600 }}>
                ● {availableUnits > 0 ? `Available: ${availableUnits} units` : 'Out of Stock'}
              </span>
              <span style={{ color: 'var(--color-text-muted)', marginLeft: '8px' }}>
                (On-hand: {currentVariant.sellable} | Active Reservations: {currentVariant.reserved})
              </span>
            </div>

            {/* Quantity and Actions */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap' }}>
              {/* Quantity increment/decrement */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: '#FFFFFF'
                }}
              >
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  style={{ width: '36px', height: '42px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1rem' }}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span style={{ width: '40px', textAlign: 'center', fontWeight: 600, fontSize: '0.9rem' }}>
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                  style={{ width: '36px', height: '42px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1rem' }}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {/* Add to Preview Bag */}
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => addToCart(product, currentVariant, quantity)}
                style={{ flex: 1, minWidth: '180px', height: '44px' }}
              >
                <ShoppingBag size={18} /> Add to Preview Bag
              </button>

              {/* Wishlist Toggle */}
              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className="btn btn-outline"
                style={{
                  width: '44px',
                  height: '44px',
                  padding: 0,
                  color: isWishlisted ? 'var(--color-burgundy)' : 'inherit'
                }}
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
              >
                <Heart size={20} fill={isWishlisted ? 'var(--color-burgundy)' : 'none'} />
              </button>
            </div>

            {/* Service Highlights */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xs)',
                padding: 'var(--space-4)',
                marginBottom: '28px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem' }}>
                <Truck size={18} color="var(--color-burgundy)" />
                <span>Complimentary insured courier delivery across India over ₹3,000.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem' }}>
                <RotateCcw size={18} color="var(--color-burgundy)" />
                <span>7-day return window in unworn condition with tags intact.</span>
              </div>
            </div>

            {/* Technical Specifications Accordion Details */}
            <div style={{ borderTop: '1px solid var(--color-border)' }}>
              <div style={{ padding: '16px 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
                <h4 style={{ fontSize: '0.92rem', marginBottom: '6px' }}>Materials &amp; Finish</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{product.materials}</p>
              </div>

              <div style={{ padding: '16px 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
                <h4 style={{ fontSize: '0.92rem', marginBottom: '6px' }}>Care Guidelines</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{product.careInstructions}</p>
              </div>

              <div style={{ padding: '16px 0' }}>
                <h4 style={{ fontSize: '0.92rem', marginBottom: '6px' }}>Dimensions &amp; Scale</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{product.dimensions}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Category Recommendations */}
        {relatedProducts.length > 0 && (
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-12)' }}>
            <h3 style={{ fontSize: '1.6rem', marginBottom: 'var(--space-6)' }}>
              More from {product.categoryName}
            </h3>
            <div className="product-grid">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
