'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PRODUCTS, CATEGORIES } from '../../../data/fixtures';
import ProductCard from '../../../components/storefront/ProductCard';
import { Search, SlidersHorizontal, RotateCcw } from 'lucide-react';

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...PRODUCTS];

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.priceMinor - b.priceMinor);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.priceMinor - a.priceMinor);
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [selectedCategory, searchQuery, sortBy]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSortBy('featured');
  };

  return (
    <div style={{ padding: 'var(--space-8) 0 var(--space-16)' }}>
      <div className="container-storefront">
        {/* Header Breadcrumb & Title */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <span style={{ fontSize: '0.78rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-gold)', fontWeight: 600 }}>
            CATALOGUE COLLECTION
          </span>
          <h1 style={{ marginTop: '4px', marginBottom: '8px' }}>
            {selectedCategory === 'all'
              ? 'Complete Assortment'
              : CATEGORIES.find((c) => c.slug === selectedCategory)?.name || 'Collection'}
          </h1>
          <p style={{ maxWidth: '640px' }}>
            Browse handcrafted jewellery pieces. Prices are illustrative and displayed in integer minor currency units. Stock and checkout will connect in subsequent nodes.
          </p>
        </div>

        {/* Filter & Control Bar */}
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xs)',
            padding: 'var(--space-4)',
            marginBottom: 'var(--space-8)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--space-4)',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          {/* Category Tabs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`btn btn-sm ${selectedCategory === 'all' ? 'btn-primary' : 'btn-outline'}`}
            >
              All Designs
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.slug)}
                className={`btn btn-sm ${selectedCategory === cat.slug ? 'btn-primary' : 'btn-outline'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search & Sort Controls */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', width: '220px' }}>
              <input
                type="text"
                placeholder="Search designs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px 7px 32px',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '0.84rem'
                }}
                aria-label="Filter products by keyword"
              />
              <Search
                size={16}
                color="var(--color-text-muted)"
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>

            {/* Sort Select */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label htmlFor="sort-select" style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                Sort:
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '7px 12px',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '0.84rem',
                  backgroundColor: '#FFFFFF',
                  cursor: 'pointer'
                }}
              >
                <option value="featured">Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Alphabetical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Counter & Active Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
            Showing <strong>{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'piece' : 'pieces'}
          </span>

          {(selectedCategory !== 'all' || searchQuery.trim()) && (
            <button
              type="button"
              onClick={resetFilters}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'none',
                border: 'none',
                color: 'var(--color-burgundy)',
                fontSize: '0.78rem',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              <RotateCcw size={13} /> Reset Filters
            </button>
          )}
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length > 0 ? (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          /* Clear Empty State */
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
              <SlidersHorizontal size={24} />
            </div>
            <h3 style={{ fontSize: '1.4rem' }}>No Designs Match Your Criteria</h3>
            <p style={{ maxWidth: '440px', fontSize: '0.88rem' }}>
              We could not find any jewellery items matching your search or active filter combination.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="btn btn-secondary btn-sm"
              style={{ marginTop: '8px' }}
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="container-storefront" style={{ padding: '60px 0', textAlign: 'center' }}>Loading collection...</div>}>
      <ShopContent />
    </Suspense>
  );
}
