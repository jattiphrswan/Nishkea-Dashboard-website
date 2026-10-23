'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
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
  Sparkles,
  ArrowLeft,
  Truck,
  RotateCcw,
  Check,
  Maximize2,
  X,
  ChevronDown
} from 'lucide-react';

export default function ProductDetailPage({ params }) {
  // Unwrap Next.js dynamic route params
  const resolvedParams = use(params);
  const slug = resolvedParams?.slug;

  const initialProduct = PRODUCTS.find((p) => p.slug === slug);
  const [product, setProduct] = useState(initialProduct || null);
  const { addToCart, toggleWishlist, isInWishlist } = useStore();

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState('materials');

  // Node 16: Immediate live update sync without server restart
  React.useEffect(() => {
    if (!slug) return;
    fetch(`/api/products/${slug}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.product) {
          setProduct(d.product);
        }
      })
      .catch(() => {});
  }, [slug]);

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

  const currentVariant = product.variants?.[selectedVariantIndex] || product.variants?.[0] || { sku: product.code, sellable: 0, reserved: 0 };
  const isWishlisted = isInWishlist(product.id);
  const relatedProducts = PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 3);
  const activeImage = Array.isArray(product.images) && product.images[selectedImageIndex] ? product.images[selectedImageIndex] : (product.images?.[0] || product.featuredImage || '/images/prodcuts/aurelia-1.png');

  const availableUnits = computeAvailableStock(currentVariant.sellable || 0, currentVariant.reserved || 0);
  const isOutOfStock = availableUnits <= 0;
  const maxBuyableUnits = product.soldIndividually ? 1 : Math.min(10, Math.max(1, availableUnits));

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, currentVariant, quantity);
    setAddedFeedback(true);
    setTimeout(() => {
      setAddedFeedback(false);
    }, 2200);
  };

  // JSON-LD Structured Metadata for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: activeImage?.url,
    description: product.description,
    sku: currentVariant.sku,
    brand: {
      '@type': 'Brand',
      name: 'NISHKÈA'
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: (product.priceMinor / 100).toFixed(2),
      availability: availableUnits > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `https://nishkea.internal/products/${product.slug}`
    }
  };

  return (
    <div style={{ padding: 'var(--space-6) 0 var(--space-16)' }}>
      {/* JSON-LD Rich Snippet */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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
            marginBottom: 'var(--space-6)',
            flexWrap: 'wrap'
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
                grid-template-columns: 1.05fr 0.95fr !important;
                gap: 56px !important;
              }
            }
          `}</style>

          {/* Left Column: Image Gallery & Lightbox */}
          <div>
            <div
              style={{
                position: 'relative',
                marginBottom: '16px',
                borderRadius: 'var(--radius-xs)',
                overflow: 'hidden',
                backgroundColor: '#FAF8F6',
                border: '1px solid var(--color-border)',
                cursor: 'zoom-in'
              }}
              onClick={() => setLightboxOpen(true)}
              title="Click to expand high-resolution view"
            >
              <PlaceholderImage
                src={activeImage?.url}
                alt={activeImage?.alt || product.name}
                aspectRatio="1 / 1"
                priority={true}
                category={product.categoryName}
              />
              <button
                type="button"
                style={{
                  position: 'absolute',
                  right: '12px',
                  bottom: '12px',
                  backgroundColor: 'rgba(255,255,255,0.85)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                aria-label="Enlarge image"
              >
                <Maximize2 size={16} />
              </button>
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {product.images.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    style={{
                      width: '76px',
                      height: '76px',
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

          {/* Right Column: Information, Variants & Actions */}
          <div>
            {/* Badges */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
              <span className="badge badge-burgundy">{product.categoryName}</span>
              <span className="badge badge-gold">{product.collectionName || product.collectionType}</span>
              {product.lifecycle === 'under_review' && (
                <span className="badge badge-warning">30-Day Trend Review</span>
              )}
              {product.lifecycle === 'clearance' && (
                <span className="badge badge-danger">Clearance Edition</span>
              )}
            </div>

            {/* Title & Code */}
            <h1 style={{ fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)', marginBottom: '8px', lineHeight: 1.2 }}>
              {product.name}
            </h1>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '18px' }}>
              Design Code: <strong>{product.code}</strong> • SKU: <strong>{currentVariant.sku}</strong>
            </div>

            {/* Price & Sales Unit */}
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '12px',
                marginBottom: '20px',
                paddingBottom: '16px',
                borderBottom: '1px solid var(--color-border)'
              }}
            >
              <span style={{ fontSize: '2.1rem', fontWeight: 700, color: 'var(--color-burgundy)' }}>
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

            {/* Variant Option Combination Selector */}
            {product.variants.length > 0 && (
              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                  Option: <span style={{ color: 'var(--color-burgundy)' }}>{currentVariant.colour} {currentVariant.size ? `• ${currentVariant.size}` : ''}</span>
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {product.variants.map((v, idx) => (
                    <button
                      key={v.sku}
                      type="button"
                      id={`variant-btn-${v.sku}`}
                      onClick={() => {
                        setSelectedVariantIndex(idx);
                        setQuantity(1);
                      }}
                      className={`btn btn-sm ${selectedVariantIndex === idx ? 'btn-primary' : 'btn-outline'}`}
                      style={{ borderRadius: 'var(--radius-xs)', fontSize: '0.8rem', padding: '6px 12px' }}
                    >
                      {v.colour} {v.size ? `(${v.size})` : ''}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Real-Time Stock Availability Indicator */}
            <div
              id="stock-indicator"
              style={{
                marginBottom: '24px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: isOutOfStock ? '#FEF2F2' : availableUnits <= 5 ? '#FFFBEB' : '#F0FDF4',
                border: `1px solid ${isOutOfStock ? '#FECACA' : availableUnits <= 5 ? '#FDE68A' : '#BBF7D0'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.82rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    color: isOutOfStock ? 'var(--color-status-danger)' : availableUnits <= 5 ? '#D97706' : 'var(--color-status-success)',
                    fontWeight: 700
                  }}
                >
                  ●
                </span>
                <strong style={{ color: isOutOfStock ? '#991B1B' : availableUnits <= 5 ? '#92400E' : '#166534' }}>
                  {isOutOfStock
                    ? 'Currently Out of Stock (Reservation Locked)'
                    : availableUnits <= 5
                    ? `Low Vault Stock: Only ${availableUnits} units remaining`
                    : `In Stock: ${availableUnits} units available for dispatch`}
                </strong>
              </div>

              <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                On-Hand: {currentVariant.sellable} • Holds: {currentVariant.reserved}
              </span>
            </div>

            {/* Quantity Stepper & Add to Bag Actions */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap' }}>
              {/* Quantity increment/decrement */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: '#FFFFFF',
                  opacity: isOutOfStock ? 0.5 : 1
                }}
              >
                <button
                  type="button"
                  id="btn-qty-minus"
                  disabled={isOutOfStock || quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  style={{ width: '38px', height: '44px', border: 'none', background: 'none', cursor: isOutOfStock ? 'not-allowed' : 'pointer', fontSize: '1rem' }}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span style={{ width: '40px', textAlign: 'center', fontWeight: 600, fontSize: '0.9rem' }}>
                  {quantity}
                </span>
                <button
                  type="button"
                  id="btn-qty-plus"
                  disabled={isOutOfStock || quantity >= maxBuyableUnits}
                  onClick={() => setQuantity((q) => Math.min(maxBuyableUnits, q + 1))}
                  style={{ width: '38px', height: '44px', border: 'none', background: 'none', cursor: (isOutOfStock || quantity >= maxBuyableUnits) ? 'not-allowed' : 'pointer', fontSize: '1rem' }}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {product.soldIndividually && (
                <span style={{ fontSize: '0.74rem', color: 'var(--color-gold)', fontWeight: 600 }}>
                  Limited to 1 unit per client order
                </span>
              )}

              {/* Add to Bag Button */}
              <button
                type="button"
                id="btn-add-to-cart"
                className="btn btn-primary"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                style={{
                  flex: 1,
                  minWidth: '200px',
                  height: '46px',
                  backgroundColor: addedFeedback ? 'var(--color-status-success)' : undefined,
                  borderColor: addedFeedback ? 'var(--color-status-success)' : undefined,
                  transition: 'background-color 0.2s ease, transform 0.15s ease'
                }}
              >
                {addedFeedback ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Check size={18} /> Added to Preview Bag
                  </span>
                ) : isOutOfStock ? (
                  'Sold Out'
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShoppingBag size={18} /> Add to Preview Bag
                  </span>
                )}
              </button>

              {/* Wishlist Toggle Button */}
              <button
                type="button"
                id="btn-toggle-wishlist"
                onClick={() => toggleWishlist(product)}
                className="btn btn-outline"
                style={{
                  width: '46px',
                  height: '46px',
                  padding: 0,
                  color: isWishlisted ? 'var(--color-burgundy)' : 'inherit'
                }}
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
              >
                <Heart size={20} fill={isWishlisted ? 'var(--color-burgundy)' : 'none'} />
              </button>
            </div>

            {/* Service & Shipping Highlights */}
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
                <span>Complimentary insured courier delivery across India on orders over ₹3,000.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem' }}>
                <RotateCcw size={18} color="var(--color-burgundy)" />
                <span>7-day transparent inspection window in original unworn condition.</span>
              </div>
            </div>

            {/* Technical Specifications Accordion Details */}
            <div style={{ borderTop: '1px solid var(--color-border)' }}>
              {/* Materials & Metal Purity */}
              <div style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                <button
                  type="button"
                  onClick={() => setActiveAccordion(activeAccordion === 'materials' ? '' : 'materials')}
                  style={{
                    width: '100%',
                    padding: '14px 0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.94rem',
                    fontWeight: 600
                  }}
                >
                  <span>Materials &amp; Artisanal Finish</span>
                  <ChevronDown
                    size={16}
                    style={{
                      transform: activeAccordion === 'materials' ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s ease'
                    }}
                  />
                </button>
                {activeAccordion === 'materials' && (
                  <div style={{ paddingBottom: '14px', fontSize: '0.86rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                    <p style={{ margin: '0 0 6px' }}>{product.materials}</p>
                    <p style={{ margin: 0, fontSize: '0.78rem' }}>
                      Certified ethically sourced components. Hallmarked finish handcrafted by traditional artisans.
                    </p>
                  </div>
                )}
              </div>

              {/* Care Guidelines */}
              <div style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                <button
                  type="button"
                  onClick={() => setActiveAccordion(activeAccordion === 'care' ? '' : 'care')}
                  style={{
                    width: '100%',
                    padding: '14px 0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.94rem',
                    fontWeight: 600
                  }}
                >
                  <span>Preservation &amp; Care Guidelines</span>
                  <ChevronDown
                    size={16}
                    style={{
                      transform: activeAccordion === 'care' ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s ease'
                    }}
                  />
                </button>
                {activeAccordion === 'care' && (
                  <div style={{ paddingBottom: '14px', fontSize: '0.86rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                    <p style={{ margin: 0 }}>{product.careInstructions}</p>
                  </div>
                )}
              </div>

              {/* Dimensions & Specifications */}
              <div>
                <button
                  type="button"
                  onClick={() => setActiveAccordion(activeAccordion === 'dimensions' ? '' : 'dimensions')}
                  style={{
                    width: '100%',
                    padding: '14px 0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.94rem',
                    fontWeight: 600
                  }}
                >
                  <span>Dimensions, Weight &amp; Sales Unit</span>
                  <ChevronDown
                    size={16}
                    style={{
                      transform: activeAccordion === 'dimensions' ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s ease'
                    }}
                  />
                </button>
                {activeAccordion === 'dimensions' && (
                  <div style={{ paddingBottom: '14px', fontSize: '0.86rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                    <p style={{ margin: '0 0 6px' }}><strong>Dimensions:</strong> {product.dimensions}</p>
                    <p style={{ margin: '0 0 6px' }}>
                      <strong>Sales Unit:</strong> {product.salesUnit === 'pair' ? 'Sold as a matching Pair' : product.salesUnit === 'set' ? 'Complete Set' : 'Single Piece'}
                    </p>
                    <p style={{ margin: 0 }}><strong>Category:</strong> {product.categoryName}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Category Recommendations */}
        {relatedProducts.length > 0 && (
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-12)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'var(--space-6)' }}>
              <div>
                <span style={{ fontSize: '0.78rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-gold)', fontWeight: 600 }}>
                  COMPLEMENTARY PIECES
                </span>
                <h3 style={{ fontSize: '1.6rem', margin: '4px 0 0' }}>
                  More from {product.categoryName}
                </h3>
              </div>
              <Link href={`/shop?category=${product.category}`} style={{ fontSize: '0.84rem', color: 'var(--color-burgundy)', fontWeight: 600 }}>
                Explore All {product.categoryName} →
              </Link>
            </div>

            <div className="product-grid">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* High-Resolution Lightbox Modal */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setLightboxOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(26, 10, 14, 0.92)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '850px',
              width: '100%',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-xs)',
              overflow: 'hidden'
            }}
          >
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                backgroundColor: 'rgba(255,255,255,0.9)',
                border: '1px solid var(--color-border)',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10
              }}
              aria-label="Close high-resolution preview"
            >
              <X size={18} />
            </button>
            <div style={{ maxHeight: '80vh', overflow: 'hidden' }}>
              <PlaceholderImage
                src={activeImage?.url}
                alt={activeImage?.alt || product.name}
                aspectRatio="1 / 1"
                category={product.categoryName}
              />
            </div>
            <div style={{ padding: '14px 20px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{product.name}</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginLeft: '10px' }}>
                  SKU: {currentVariant.sku}
                </span>
              </div>
              <span style={{ fontSize: '0.82rem', color: 'var(--color-burgundy)', fontWeight: 600 }}>
                {formatCurrency(product.priceMinor, product.currency)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
