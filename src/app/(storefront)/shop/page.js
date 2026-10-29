'use client';

import React, { useState, useMemo, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PRODUCTS, CATEGORIES } from '../../../data/fixtures';
import ProductCard from '../../../components/storefront/ProductCard';
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  X,
  Sparkles,
  ChevronDown,
  Check,
  Grid3x3,
  LayoutGrid,
  Gem,
  Crown
} from 'lucide-react';

const PRICE_OPTIONS = [
  { value: 'all', label: 'All Valuations', sub: 'Complete Spectrum' },
  { value: 'under_1500', label: 'Under ₹1,500', sub: 'Accessible Elegance' },
  { value: '1500_3000', label: '₹1,500 – ₹3,000', sub: 'Signature Atelier' },
  { value: 'above_3000', label: 'Above ₹3,000', sub: 'Haute Masterworks' }
];

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured Pieces', sub: "Curator's Selection" },
  { value: 'price-asc', label: 'Price: Low to High', sub: 'Accessible First' },
  { value: 'price-desc', label: 'Price: High to Low', sub: 'Prestige First' },
  { value: 'newest', label: 'Newest Launch', sub: 'Recent Seasonal Edits' },
  { value: 'name', label: 'Alphabetical (A–Z)', sub: 'Design Nomenclature' }
];

const QUICK_STONES = [
  { label: 'Ruby Solitaire', query: 'ruby' },
  { label: 'Polki Kundan', query: 'polki' },
  { label: '18K Vermeil', query: '18k' },
  { label: 'Chandbali Pearl', query: 'pearl' },
  { label: 'Artisan Filigree', query: 'filigree' }
];

function CategoryIcon({ slug }) {
  switch (slug) {
    case 'all':
      return <Sparkles size={16} />;
    case 'earrings':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a4 4 0 0 0-4 4c0 3 4 8 4 8s4-5 4-8a4 4 0 0 0-4-4z" />
          <circle cx="12" cy="18" r="3" />
        </svg>
      );
    case 'rings':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="14" r="7" />
          <path d="M9 5l3-3 3 3" />
          <path d="M12 2v5" />
        </svg>
      );
    case 'necklaces-pendants':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 3c0 7 3 13 6 13s6-6 6-13" />
          <circle cx="12" cy="19" r="2.5" />
        </svg>
      );
    case 'hair-accessories':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z" />
          <path d="M5 19h14" />
        </svg>
      );
    case 'nose-rings-pins':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="7" />
          <circle cx="12" cy="5" r="1.5" fill="currentColor" />
        </svg>
      );
    default:
      return <Gem size={16} />;
  }
}

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
  const [gridCols, setGridCols] = useState(3); // 3 or 4 columns
  const [liveProducts, setLiveProducts] = useState(
    PRODUCTS.filter((p) => p.publishState !== 'draft' && p.lifecycle !== 'archived')
  );

  // Dropdown open states
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const priceDropdownRef = useRef(null);
  const sortDropdownRef = useRef(null);

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

  // Click outside listener for custom dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (priceDropdownRef.current && !priceDropdownRef.current.contains(event.target)) {
        setIsPriceOpen(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setIsSortOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsPriceOpen(false);
        setIsSortOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

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
    setIsPriceOpen(false);
    syncUrlParams({ price: priceVal });
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    syncUrlParams({ search: query });
  };

  const handleSortChange = (sortVal) => {
    setSortBy(sortVal);
    setIsSortOpen(false);
    syncUrlParams({ sort: sortVal });
  };

  const handleQuickStoneClick = (stoneQuery) => {
    if (searchQuery.toLowerCase() === stoneQuery.toLowerCase()) {
      handleSearchChange('');
    } else {
      handleSearchChange(stoneQuery);
    }
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
  const currentPriceLabel = PRICE_OPTIONS.find((p) => p.value === selectedPrice)?.label || 'All Valuations';
  const currentSortLabel = SORT_OPTIONS.find((s) => s.value === sortBy)?.label || 'Featured Pieces';

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

        {/* Creative Haute Joaillerie Atelier Curator Suite */}
        <div className="shop-curator-suite">
          {/* Top Status & Brand Eyebrow Bar */}
          <div className="shop-curator-eyebrow-bar">
            <div className="shop-curator-badge">
              <Sparkles size={13} className="shop-curator-badge-icon" />
              <span>✦ ATELIER VAULT CURATOR ✦</span>
            </div>

            <div className="shop-curator-status">
              <span className="shop-curator-pulse-dot" aria-hidden="true" />
              <span>
                Live Vault Synchronized • <strong>{liveProducts.length}</strong> Masterworks
              </span>
            </div>
          </div>

          {/* Row 1: Architectural Category Pills Rail */}
          <div className="curator-categories-scroll-wrap" role="tablist" aria-label="Filter by Jewellery Category">
            <div className="curator-categories-rail">
              <button
                type="button"
                id="btn-cat-all"
                role="tab"
                aria-selected={selectedCategory === 'all'}
                onClick={() => handleCategoryChange('all')}
                className={`curator-cat-pill ${selectedCategory === 'all' ? 'active' : ''}`}
              >
                <span className="curator-cat-icon">
                  <CategoryIcon slug="all" />
                </span>
                <span>All Designs</span>
                <span className="curator-cat-count">{PRODUCTS.length}</span>
              </button>

              {CATEGORIES.map((cat) => {
                const count = PRODUCTS.filter((p) => p.category === cat.slug).length;
                const isSelected = selectedCategory === cat.slug;
                return (
                  <button
                    key={cat.id}
                    id={`btn-cat-${cat.slug}`}
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => handleCategoryChange(cat.slug)}
                    className={`curator-cat-pill ${isSelected ? 'active' : ''}`}
                  >
                    <span className="curator-cat-icon">
                      <CategoryIcon slug={cat.slug} />
                    </span>
                    <span>{cat.name}</span>
                    <span className="curator-cat-count">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 2: Search with Curator Stone & Motif Suggestions */}
          <div className="curator-search-row">
            <div className="curator-search-field-wrap">
              <Search size={18} className="curator-search-icon" />
              <input
                type="text"
                id="shop-search-input"
                placeholder="Search designs by gemstone, finish, motif or SKU..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="curator-search-input"
                aria-label="Filter products by keyword or SKU"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => handleSearchChange('')}
                  className="curator-search-clear"
                  aria-label="Clear search text"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Quick Stone & Motif Curator Pills */}
            <div className="curator-quick-tags" aria-label="Curator quick search suggestions">
              <span className="curator-quick-label">Curator&apos;s Picks:</span>
              {QUICK_STONES.map((stone) => {
                const isActive = searchQuery.toLowerCase() === stone.query.toLowerCase();
                return (
                  <button
                    key={stone.query}
                    type="button"
                    onClick={() => handleQuickStoneClick(stone.query)}
                    className={`curator-quick-pill ${isActive ? 'active' : ''}`}
                  >
                    ✨ {stone.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 3: Secondary Curation Controls (Collection Pills & Custom Luxury Dropdowns) */}
          <div className="curator-controls-bar">
            {/* Collection Filter Buttons */}
            <div className="curator-collection-group">
              <span className="curator-collection-label">Collection:</span>
              {[
                { label: 'All Collections', val: 'all', badge: '' },
                { label: '30-Day Trend', val: 'monthly_trend', badge: '🔥' },
                { label: 'Permanent Line', val: 'permanent', badge: '👑' },
                { label: 'Clearance', val: 'clearance', badge: '🏷️' }
              ].map((c) => (
                <button
                  key={c.val}
                  type="button"
                  onClick={() => handleCollectionChange(c.val)}
                  className={`curator-collection-pill ${selectedCollection === c.val ? 'active' : ''}`}
                >
                  {c.badge && <span>{c.badge}</span>}
                  <span>{c.label}</span>
                </button>
              ))}
            </div>

            {/* Luxury Custom Floating Dropdowns for Price & Sort */}
            <div className="curator-dropdowns-group">
              {/* Bespoke Luxury Price Dropdown */}
              <div className="curator-custom-dropdown" ref={priceDropdownRef}>
                <button
                  type="button"
                  className={`curator-dropdown-btn ${isPriceOpen ? 'active' : ''}`}
                  onClick={() => {
                    setIsPriceOpen((prev) => !prev);
                    setIsSortOpen(false);
                  }}
                  aria-haspopup="listbox"
                  aria-expanded={isPriceOpen}
                >
                  <span className="curator-dropdown-label-prefix">Valuation:</span>
                  <span className="curator-dropdown-current-val">{currentPriceLabel}</span>
                  <ChevronDown size={14} className={`curator-dropdown-chevron ${isPriceOpen ? 'open' : ''}`} />
                </button>

                {isPriceOpen && (
                  <div className="curator-dropdown-popover" role="listbox" aria-label="Select Valuation Range">
                    <div className="curator-dropdown-popover-title">Select Valuation Range</div>
                    {PRICE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        role="option"
                        aria-selected={selectedPrice === opt.value}
                        onClick={() => handlePriceChange(opt.value)}
                        className={`curator-popover-item ${selectedPrice === opt.value ? 'selected' : ''}`}
                      >
                        <div className="curator-popover-item-text">
                          <span className="curator-popover-main">{opt.label}</span>
                          <span className="curator-popover-sub">{opt.sub}</span>
                        </div>
                        {selectedPrice === opt.value && <Check size={14} className="curator-popover-check" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Bespoke Luxury Sort Dropdown */}
              <div className="curator-custom-dropdown" ref={sortDropdownRef}>
                <button
                  type="button"
                  className={`curator-dropdown-btn ${isSortOpen ? 'active' : ''}`}
                  onClick={() => {
                    setIsSortOpen((prev) => !prev);
                    setIsPriceOpen(false);
                  }}
                  aria-haspopup="listbox"
                  aria-expanded={isSortOpen}
                >
                  <span className="curator-dropdown-label-prefix">Sort By:</span>
                  <span className="curator-dropdown-current-val">{currentSortLabel}</span>
                  <ChevronDown size={14} className={`curator-dropdown-chevron ${isSortOpen ? 'open' : ''}`} />
                </button>

                {isSortOpen && (
                  <div className="curator-dropdown-popover" role="listbox" aria-label="Select Sort Order">
                    <div className="curator-dropdown-popover-title">Sort Criteria</div>
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        role="option"
                        aria-selected={sortBy === opt.value}
                        onClick={() => handleSortChange(opt.value)}
                        className={`curator-popover-item ${sortBy === opt.value ? 'selected' : ''}`}
                      >
                        <div className="curator-popover-item-text">
                          <span className="curator-popover-main">{opt.label}</span>
                          <span className="curator-popover-sub">{opt.sub}</span>
                        </div>
                        {sortBy === opt.value && <Check size={14} className="curator-popover-check" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Results Counter, Active Filter Tags & Grid Density Switcher */}
        <div className="curator-results-strip">
          <div className="curator-results-left">
            <span className="curator-results-count">
              <span className="curator-count-bullet">✦</span>
              Revealing <strong>{filteredProducts.length}</strong>{' '}
              {filteredProducts.length === 1 ? 'Handcrafted Piece' : 'Handcrafted Pieces'}
            </span>

            {/* Active filter chips */}
            {selectedCategory !== 'all' && (
              <span className="curator-active-tag">
                Category: {currentCategoryData?.name || selectedCategory}
                <button
                  type="button"
                  onClick={() => handleCategoryChange('all')}
                  className="curator-tag-dismiss"
                  aria-label="Remove category filter"
                >
                  <X size={13} />
                </button>
              </span>
            )}

            {selectedCollection !== 'all' && (
              <span className="curator-active-tag">
                Collection: {selectedCollection === 'monthly_trend' ? '30-Day Trend' : selectedCollection}
                <button
                  type="button"
                  onClick={() => handleCollectionChange('all')}
                  className="curator-tag-dismiss"
                  aria-label="Remove collection filter"
                >
                  <X size={13} />
                </button>
              </span>
            )}

            {selectedPrice !== 'all' && (
              <span className="curator-active-tag">
                Valuation: {currentPriceLabel}
                <button
                  type="button"
                  onClick={() => handlePriceChange('all')}
                  className="curator-tag-dismiss"
                  aria-label="Remove price filter"
                >
                  <X size={13} />
                </button>
              </span>
            )}

            {searchQuery.trim() && (
              <span className="curator-active-tag">
                Query: &ldquo;{searchQuery}&rdquo;
                <button
                  type="button"
                  onClick={() => handleSearchChange('')}
                  className="curator-tag-dismiss"
                  aria-label="Remove search filter"
                >
                  <X size={13} />
                </button>
              </span>
            )}
          </div>

          <div className="curator-results-actions">
            {/* Grid Density Switcher */}
            <div className="curator-grid-toggle" aria-label="Catalogue Grid Layout">
              <button
                type="button"
                onClick={() => setGridCols(3)}
                className={`curator-grid-btn ${gridCols === 3 ? 'active' : ''}`}
                title="Boutique Showcase (3 Columns)"
                aria-label="Boutique Showcase (3 Columns)"
              >
                <Grid3x3 size={14} />
                <span>3 Columns</span>
              </button>
              <button
                type="button"
                onClick={() => setGridCols(4)}
                className={`curator-grid-btn ${gridCols === 4 ? 'active' : ''}`}
                title="Vault Gallery (4 Columns)"
                aria-label="Vault Gallery (4 Columns)"
              >
                <LayoutGrid size={14} />
                <span>4 Columns</span>
              </button>
            </div>

            {/* Clear All Filters */}
            {activeFilterCount > 0 && (
              <button
                type="button"
                id="btn-reset-filters"
                onClick={resetAllFilters}
                className="curator-reset-all-btn"
              >
                <RotateCcw size={13} className="curator-reset-icon" />
                <span>Reset All ({activeFilterCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* Product Cards Grid with Dynamic Density */}
        {filteredProducts.length > 0 ? (
          <div className={`product-grid grid-cols-${gridCols}`}>
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px dashed rgba(182, 151, 99, 0.45)',
              borderRadius: '16px',
              padding: 'var(--space-16) var(--space-6)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.02)'
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: 'rgba(120, 29, 57, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-burgundy)',
                border: '1px solid rgba(182, 151, 99, 0.3)'
              }}
            >
              <SlidersHorizontal size={24} />
            </div>
            <h3 style={{ fontSize: '1.4rem', margin: 0, fontFamily: 'var(--font-serif)' }}>
              No Masterworks Match Your Curation
            </h3>
            <p style={{ maxWidth: '440px', fontSize: '0.88rem', color: 'var(--color-text-muted)', margin: 0 }}>
              We could not find any jewellery items matching your search or active filter combination. Try resetting your curation or exploring our complete collection.
            </p>
            <button
              type="button"
              id="btn-empty-clear-filters"
              onClick={resetAllFilters}
              className="btn btn-secondary btn-sm"
              style={{ marginTop: '8px', borderRadius: '9999px', padding: '8px 20px' }}
            >
              Reset All Curations
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
