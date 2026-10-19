'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '../../../context/StoreContext';
import { formatCurrency } from '../../../lib/formatters';
import PlaceholderImage from '../../../components/ui/PlaceholderImage';
import { Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export default function WishlistPage() {
  const { wishlist, toggleWishlist, addToCart } = useStore();

  return (
    <div style={{ padding: 'var(--space-8) 0 var(--space-16)' }}>
      <div className="container-storefront">
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <span style={{ fontSize: '0.78rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-gold)', fontWeight: 600 }}>
            SAVED PIECES
          </span>
          <h1 style={{ marginTop: '4px', marginBottom: '8px' }}>Your Wishlist</h1>
          <p style={{ maxWidth: '580px' }}>
            Curated favourites saved to your device. Wishlist preferences are stored locally in your browser for this preview.
          </p>
        </div>

        {wishlist.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 'var(--space-6)'
            }}
          >
            {wishlist.map((item) => (
              <div
                key={item.id}
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-xs)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ aspectRatio: '1 / 1', position: 'relative' }}>
                  <Link href={`/products/${item.slug}`}>
                    <PlaceholderImage
                      src={item.images && item.images[0]?.url}
                      alt={item.name}
                      category={item.categoryName}
                    />
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleWishlist(item)}
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid var(--color-border)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-status-danger)'
                    }}
                    aria-label={`Remove ${item.name} from wishlist`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                    {item.categoryName}
                  </span>
                  <h3 style={{ fontSize: '1.1rem', margin: '4px 0 8px' }}>
                    <Link href={`/products/${item.slug}`}>{item.name}</Link>
                  </h3>
                  <div style={{ marginTop: 'auto', paddingTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 700, color: 'var(--color-burgundy)', fontSize: '1.05rem' }}>
                      {formatCurrency(item.priceMinor, item.currency)}
                    </span>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => addToCart(item, item.variants && item.variants[0], 1)}
                    >
                      <ShoppingBag size={14} /> Add to Bag
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty Wishlist State */
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px dashed var(--color-border)',
              borderRadius: 'var(--radius-xs)',
              padding: 'var(--space-16) var(--space-6)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'rgba(112, 26, 54, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-burgundy)'
              }}
            >
              <Heart size={24} />
            </div>
            <h2 style={{ fontSize: '1.5rem' }}>Your Wishlist is Empty</h2>
            <p style={{ maxWidth: '440px', fontSize: '0.9rem' }}>
              Explore our jewellery collection and tap the heart icon on any piece to save it for your consideration.
            </p>
            <Link href="/shop" className="btn btn-primary" style={{ marginTop: '8px' }}>
              Explore Catalogue <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
