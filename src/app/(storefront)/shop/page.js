'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PRODUCTS, CATEGORIES } from '../../../data/fixtures';
import ProductCard from '../../../components/storefront/ProductCard';
import { Search, SlidersHorizontal, RotateCcw, X, Sparkles, Filter } from 'lucide-react';

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read initial states from URL query parameters
  const initialCategory = searchParams.get('category') || 'all';
  const initialCollection = searchParams.get('collection') || 'all';
  const initialPrice = searchParams.get('price') || 'all';
  const initialSearch = searchParams.get('q') || '';
  const initialSort = searchParams.get('sort') || 'featured';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedCollection, setSelectedCollection] = useState(initialCollection);
  const [selectedPrice, setSelectedPrice] = useState(initialPrice);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState(initialSort);
  const [liveProducts, setLiveProducts] = useState(PRODUCTS.filter((p) => p.publishState !== 'draft' && p.lifecycle !== 'archived'));

  // Node 16: Immediate live catalogue sync without server restart
  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.products) {
          setLiveProducts(d.products.filter((p) => p.publishState !== 'draft' && p.lifecycle !== 'archived'));
        }
      })
      .catch(() => {});
  }, []);

  // Sync state if URL searchParams change externally (e.g. back button or header link)
  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || 'all');
    setSelectedCollection(searchParams.get('collection') || 'all');
    setSelectedPrice(searchParams.get('price') || 'all');
    setSearchQuery(searchParams.get('q') || '');
    setSortBy(searchParams.get('sort') || 'featured');
  }, [searchParams]);

  // Synchronize URL query parameters with active filters
  const syncUrlParams = (newFilters) => {
    const params = new URLSearchParams();
    const cat = newFilters.category !== undefined ? newFilters.category : selectedCategory;
    const col = newFilters.collection !== undefined ? newFilters.collection : selectedCollection;
    const pri = newFilters.price !== undefined ? newFilters.price : selectedPrice;
    const q = newFilters.search !== undefined ? newFilters.search : searchQuery;
    const sort = newFilters.sort !== undefined ? newFilters.sort : sortBy;

    if (cat && cat !== 'all') params.set('category', cat);
    if (col && col !== 'all') params.set('collection', col);
    if (pri && pri !== 'all') params.set('price', pri);
    if (q && q.trim()) params.set('q', q.trim());
    if (sort && sort !== 'featured') params.set('sort', sort);

    const queryStr = params.toString();
    router.replace(`/shop${queryStr ? `?${queryStr}` : ''}`, { scroll: false });
  };

  const handleCategoryChange = (catSlug) => {
    setSelectedCategory(catSlug);
    syncUrlParams({ category: catSlug });
  };

  const handleCollectionChange = (colSlug) => {
    setSelectedCollection(colSlug);
    syncUrlParams({ collection: colSlug });
  };

  const handlePriceChange = (priceVal) => {
    setSelectedPrice(priceVal);
    syncUrlParams({ price: priceVal });
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    syncUrlParams({ search: query });
  };

  const handleSortChange = (sortVal) => {
    setSortBy(sortVal);
    syncUrlParams({ sort: sortVal });
  };

  const resetAllFilters = () => {
    setSelectedCategory('all');
    setSelectedCollection('all');
    setSelectedPrice('all');
    setSearchQuery('');
    setSortBy('featured');
    router.replace('/shop', { scroll: false });
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...liveProducts];

    // 1. Category filter
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // 2. Collection filter
    if (selectedCollection !== 'all') {
      if (selectedCollection === 'clearance') {
        result = result.filter((p) => p.lifecycle === 'clearance');
      } else {
        result = result.filter((p) => p.collectionType === selectedCollection);
      }
    }

    // 3. Price range filter (in minor currency units: 100 paise = 1 INR)
    if (selectedPrice !== 'all') {
      if (selectedPrice === 'under_1500') {
        result = result.filter((p) => p.priceMinor < 150000);
      } else if (selectedPrice === '1500_3000') {
        result = result.filter((p) => p.priceMinor >= 150000 && p.priceMinor <= 300000);
      } else if (selectedPrice === 'above_3000') {
        result = result.filter((p) => p.priceMinor > 300000);
      }
    }

    // 4. Keyword search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p) => {
        const inName = p.name.toLowerCase().includes(q);
        const inCat = p.categoryName.toLowerCase().includes(q);
        const inDesc = p.description.toLowerCase().includes(q);
        const inCode = p.code.toLowerCase().includes(q);
        const inSkus = p.variants?.some((v) => v.sku.toLowerCase().includes(q) || v.colour.toLowerCase().includes(q));
        return inName || inCat || inDesc || inCode || inSkus;
      });
    }

    // 5. Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.priceMinor - b.priceMinor);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.priceMinor - a.priceMinor);
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.launchDate || '2026-01-01') - new Date(a.launchDate || '2026-01-01'));
    } else {
      // 'featured': Bestsellers & New items prioritized
      result.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
    }

    return result;
  }, [selectedCategory, selectedCollection, selectedPrice, searchQuery, sortBy, liveProducts]);

  const activeFilterCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedCollection !== 'all' ? 1 : 0) +
    (selectedPrice !== 'all' ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  const currentCategoryData = CATEGORIES.find((c) => c.slug === selectedCategory);

  return (
    <div style={{ padding: 'var(--space-8) 0 var(--space-16)' }}>
      <div className="container-storefront">
        {/* Header Breadcrumb & Title */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-gold)', fontWeight: 600 }}>
              ATELIER CATALOGUE
            </span>
            <span style={{ color: 'var(--color-border)' }}>•</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              Handcrafted in Jaipur &amp; Mumbai
            </span>
          </div>

          <h1 style={{ marginTop: '4px', marginBottom: '8px' }}>
            {selectedCategory === 'all'
              ? selectedCollection === 'monthly_trend'
                ? 'The 30-Day Trend Collection'
                : selectedCollection === 'permanent'
                ? 'Permanent Atelier Collection'
                : selectedCollection === 'clearance'
                ? 'Vault Clearance Editions'
                : 'Complete Jewellery Assortment'
              : currentCategoryData?.name || 'Curated Collection'}
          </h1>

          <p style={{ maxWidth: '640px', fontSize: '0.92rem', color: 'var(--color-text-muted)', margin: 0 }}>
            {selectedCategory === 'all'
              ? 'Browse certified artisanal jewellery pieces with transparent option variants, real-time vault availability, and integer minor currency valuations.'
              : currentCategoryData?.description || 'Authentic handcrafted pieces.'}
          </p>
        </div>

        {/* Master Control Tray */}
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xs)',
            padding: 'var(--space-4) var(--space-5)',
            marginBottom: 'var(--space-6)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)'
          }}
        >
          {/* Row 1: Primary Category Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              <button
                type="button"
                id="btn-cat-all"
                onClick={() => handleCategoryChange('all')}
                className={`btn btn-sm ${selectedCategory === 'all' ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.8rem', padding: '6px 14px' }}
              >
                All Designs ({PRODUCTS.length})
              </button>
              {CATEGORIES.map((cat) => {
                const count = PRODUCTS.filter((p) => p.category === cat.slug).length;
                return (
                  <button
                    key={cat.id}
                    id={`btn-cat-${cat.slug}`}
                    type="button"
                    onClick={() => handleCategoryChange(cat.slug)}
                    className={`btn btn-sm ${selectedCategory === cat.slug ? 'btn-primary' : 'btn-outline'}`}
                    style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                  >
                    {cat.name} ({count})
                  </button>
                );
              })}
            </div>

            {/* Keyword Search */}
            <div style={{ position: 'relative', width: '240px' }}>
              <input
                type="text"
                id="shop-search-input"
                placeholder="Search designs or SKU..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 28px 7px 32px',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '0.84rem'
                }}
                aria-label="Filter products by keyword or SKU"
              />
              <Search
                size={16}
                color="var(--color-text-muted)"
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => handleSearchChange('')}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-text-muted)'
                  }}
                  aria-label="Clear search text"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Row 2: Secondary Filters (Collection, Price Range, Sort) */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: 'var(--space-3)',
              borderTop: '1px solid var(--color-border-subtle)'
            }}
          >
            {/* Collection Filter Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                Collection:
              </span>
              {[
                { label: 'All Collections', val: 'all' },
                { label: '30-Day Trend', val: 'monthly_trend' },
                { label: 'Permanent Line', val: 'permanent' },
                { label: 'Clearance', val: 'clearance' }
              ].map((c) => (
                <button
                  key={c.val}
                  type="button"
                  onClick={() => handleCollectionChange(c.val)}
                  style={{
                    border: selectedCollection === c.val ? '1px solid var(--color-burgundy)' : '1px solid var(--color-border)',
                    backgroundColor: selectedCollection === c.val ? '#FAF1F3' : '#FFFFFF',
                    color: selectedCollection === c.val ? 'var(--color-burgundy)' : 'var(--color-text-muted)',
                    borderRadius: '20px',
                    padding: '3px 10px',
                    fontSize: '0.74rem',
                    fontWeight: selectedCollection === c.val ? 600 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Price & Sort Selects */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              {/* Price Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <label htmlFor="price-select" style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                  Price:
                </label>
                <select
                  id="price-select"
                  value={selectedPrice}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  style={{
                    padding: '6px 10px',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '0.8rem',
                    backgroundColor: '#FFFFFF',
                    cursor: 'pointer'
                  }}
                >
                  <option value="all">All Valuations</option>
                  <option value="under_1500">Under ₹1,500</option>
                  <option value="1500_3000">₹1,500 – ₹3,000</option>
                  <option value="above_3000">Above ₹3,000</option>
                </select>
              </div>

              {/* Sort Order */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <label htmlFor="sort-select" style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                  Sort:
                </label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '0.8rem',
                    backgroundColor: '#FFFFFF',
                    cursor: 'pointer'
                  }}
                >
                  <option value="featured">Featured Pieces</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="newest">Newest Launch</option>
                  <option value="name">Alphabetical (A–Z)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results Counter & Active Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)' }}>
              Showing <strong>{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'handcrafted piece' : 'handcrafted pieces'}
            </span>

            {/* Active filter chips */}
            {selectedCategory !== 'all' && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: '#FAF1F3',
                  border: '1px solid #E8C4CE',
                  borderRadius: '12px',
                  padding: '2px 8px',
                  fontSize: '0.72rem',
                  color: 'var(--color-burgundy)',
                  fontWeight: 600
                }}
              >
                Category: {currentCategoryData?.name || selectedCategory}
                <button
                  type="button"
                  onClick={() => handleCategoryChange('all')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit' }}
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {selectedCollection !== 'all' && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: '#FAF1F3',
                  border: '1px solid #E8C4CE',
                  borderRadius: '12px',
                  padding: '2px 8px',
                  fontSize: '0.72rem',
                  color: 'var(--color-burgundy)',
                  fontWeight: 600
                }}
              >
                Collection: {selectedCollection === 'monthly_trend' ? '30-Day Trend' : selectedCollection}
                <button
                  type="button"
                  onClick={() => handleCollectionChange('all')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit' }}
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {selectedPrice !== 'all' && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: '#FAF1F3',
                  border: '1px solid #E8C4CE',
                  borderRadius: '12px',
                  padding: '2px 8px',
                  fontSize: '0.72rem',
                  color: 'var(--color-burgundy)',
                  fontWeight: 600
                }}
              >
                Price: {selectedPrice === 'under_1500' ? '< ₹1,500' : selectedPrice === '1500_3000' ? '₹1,500 – ₹3,000' : '> ₹3,000'}
                <button
                  type="button"
                  onClick={() => handlePriceChange('all')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit' }}
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {searchQuery.trim() && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: '#FAF1F3',
                  border: '1px solid #E8C4CE',
                  borderRadius: '12px',
                  padding: '2px 8px',
                  fontSize: '0.72rem',
                  color: 'var(--color-burgundy)',
                  fontWeight: 600
                }}
              >
                Search: &ldquo;{searchQuery}&rdquo;
                <button
                  type="button"
                  onClick={() => handleSearchChange('')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit' }}
                >
                  <X size={12} />
                </button>
              </span>
            )}
          </div>

          {activeFilterCount > 0 && (
            <button
              type="button"
              id="btn-reset-filters"
              onClick={resetAllFilters}
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
              <RotateCcw size={13} /> Clear All Filters ({activeFilterCount})
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
            <h3 style={{ fontSize: '1.4rem', margin: 0 }}>No Designs Match Your Selected Filters</h3>
            <p style={{ maxWidth: '440px', fontSize: '0.88rem', color: 'var(--color-text-muted)', margin: 0 }}>
              We could not find any jewellery items matching your search or active filter combination. Try clearing your filters or exploring our other collections.
            </p>
            <button
              type="button"
              id="btn-empty-clear-filters"
              onClick={resetAllFilters}
              className="btn btn-secondary btn-sm"
              style={{ marginTop: '8px' }}
            >
              Reset All Filters
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
