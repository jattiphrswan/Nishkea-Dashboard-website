'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '../../context/StoreContext';
import { formatCurrency, computeAvailableStock } from '../../lib/formatters';
import { Heart } from 'lucide-react';
import PlaceholderImage from '../ui/PlaceholderImage';

export default function ProductCard({ product }) {
  const { toggleWishlist, isInWishlist } = useStore();
  const isWishlisted = isInWishlist(product.id);

  const mainImage = (product.images && product.images[0]?.url) || '/images/categories/earrings.svg';

  const totalAvailable = product.variants?.reduce(
    (acc, v) => acc + computeAvailableStock(v.sellable, v.reserved),
    0
  ) ?? 0;

  return (
    <article className="product-card" aria-label={product.name}>
      {/* Product Image & Badges */}
      <div className="product-card-media">
        <Link href={`/products/${product.slug}`} tabIndex={-1} aria-hidden="true">
          <PlaceholderImage
            src={mainImage}
            alt={product.name}
            aspectRatio="1 / 1"
            category={product.categoryName}
          />
        </Link>

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
        <span className="product-card-category">{product.categoryName}</span>
        <h3 className="product-card-title">
          <Link href={`/products/${product.slug}`}>
            {product.name}
          </Link>
        </h3>

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
