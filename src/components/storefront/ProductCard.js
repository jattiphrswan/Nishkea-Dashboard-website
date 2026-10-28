'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '../../context/StoreContext';
import { formatCurrency, computeAvailableStock } from '../../lib/formatters';
import { Heart, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import PlaceholderImage from '../ui/PlaceholderImage';

export default function ProductCard({ product, onQuickView }) {
  const { toggleWishlist, isInWishlist } = useStore();
  const isWishlisted = isInWishlist(product.id);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const images = (product.images && product.images.length > 0)
    ? product.images
    : [{ url: '/images/categories/earrings.svg', alt: product.name }];

  const currentImage = images[activeImageIdx]?.url || images[0]?.url;

  const totalAvailable = product.variants?.reduce(
    (acc, v) => acc + computeAvailableStock(v.sellable, v.reserved),
    0
  ) ?? 0;

  const handlePrevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImageIdx((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImageIdx((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleDotClick = (e, idx) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImageIdx(idx);
  };

  return (
    <article className="product-card" aria-label={product.name}>
      {/* Product Image & Badges */}
      <div className="product-card-media">
        <Link href={`/products/${product.slug}`} tabIndex={-1} aria-hidden="true">
          <PlaceholderImage
            src={currentImage}
            alt={images[activeImageIdx]?.alt || product.name}
            aspectRatio="1 / 1"
            category={product.categoryName}
          />
        </Link>

        {/* Gallery Navigation Arrows (if multiple photos) */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              className="gallery-nav-arrow gallery-nav-prev"
              style={{ width: '28px', height: '28px', opacity: 0.85 }}
              onClick={handlePrevImage}
              aria-label="Previous image angle"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              className="gallery-nav-arrow gallery-nav-next"
              style={{ width: '28px', height: '28px', opacity: 0.85 }}
              onClick={handleNextImage}
              aria-label="Next image angle"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}

        {/* Mini Gallery Switcher Indicator Dots */}
        {images.length > 1 && (
          <div className="product-card-dots">
            {images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                className={`product-card-dot ${activeImageIdx === idx ? 'active' : ''}`}
                onClick={(e) => handleDotClick(e, idx)}
                aria-label={`View photo angle ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Quick View Button (hover overlay) */}
        {onQuickView && (
          <button
            type="button"
            className="product-card-quickview-btn"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onQuickView(product, activeImageIdx);
            }}
            aria-label={`Quick view gallery & description for ${product.name}`}
          >
            <Eye size={13} />
            <span>Quick View</span>
          </button>
        )}

        {/* Top Badges */}
        <div className="product-card-badge" style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
          {product.lifecycle === 'clearance' ? (
            <span className="badge badge-danger">Clearance</span>
          ) : totalAvailable <= 0 ? (
            <span className="badge badge-danger">Sold Out</span>
          ) : totalAvailable <= 5 ? (
            <span className="badge badge-warning">Low Stock ({totalAvailable} left)</span>
          ) : product.isNew ? (
            <span className="badge badge-burgundy">New</span>
          ) : product.isBestSeller ? (
            <span className="badge badge-gold">Bestseller</span>
          ) : null}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          className="product-card-wishlist"
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product);
          }}
          aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          style={{ color: isWishlisted ? 'var(--color-burgundy)' : 'var(--color-text-muted)' }}
        >
          <Heart size={16} fill={isWishlisted ? 'var(--color-burgundy)' : 'none'} />
        </button>
      </div>

      {/* Product Details */}
      <div className="product-card-body">
        <div className="product-card-info-top">
          <span className="product-card-category">{product.categoryName}</span>
          <h3 className="product-card-title">
            <Link href={`/products/${product.slug}`}>
              {product.name}
            </Link>
          </h3>
        </div>

        <div className="product-card-meta">
          <span className="product-card-price">
            {formatCurrency(product.priceMinor, product.currency)}
          </span>
          <span className="product-card-unit">
            {product.salesUnit === 'pair' ? 'Sold as Pair' : product.salesUnit === 'set' ? 'Set' : 'Per Piece'}
          </span>
        </div>
      </div>
    </article>
  );
}

