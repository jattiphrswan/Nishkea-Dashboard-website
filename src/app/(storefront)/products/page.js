'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { PRODUCTS, CATEGORIES } from '../../../data/fixtures';
import { useStore } from '../../../context/StoreContext';
import { formatCurrency, computeAvailableStock } from '../../../lib/formatters';
import PlaceholderImage from '../../../components/ui/PlaceholderImage';
import ProductCard from '../../../components/storefront/ProductCard';
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  X,
  Sparkles,
  ShoppingBag,
  Heart,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Layers,
  LayoutGrid,
  Check,
  ShieldCheck,
  Ruler,
  Info
} from 'lucide-react';

/**
 * Editorial Gallery Showcase Item
 * Features full multi-angle photo gallery switcher, high-res zoom,
 * complete artisanal narrative description, materials, dimensions, and variant stock selector.
 */
function GalleryShowcaseItem({ product, onOpenLightbox }) {
  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const isWishlisted = isInWishlist(product.id);

  const images = (product.images && product.images.length > 0)
    ? product.images
    : [{ url: '/images/categories/earrings.svg', alt: product.name }];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);

  const activeImage = images[activeImageIndex] || images[0];
  const currentVariant = product.variants[selectedVariantIndex] || product.variants[0];

  const availableUnits = computeAvailableStock(currentVariant.sellable, currentVariant.reserved);
  const isOutOfStock = availableUnits <= 0;

  const totalAvailable = product.variants?.reduce(
    (acc, v) => acc + computeAvailableStock(v.sellable, v.reserved),
    0
  ) ?? 0;

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, currentVariant, quantity);
    setAddedFeedback(true);
    setTimeout(() => {
      setAddedFeedback(false);
    }, 2000);
  };

  return (
    <article className="gallery-showcase-item" aria-label={product.name}>
      {/* Left: Gallery Media Panel with Angle Switcher & Thumbnails */}
      <div className="gallery-media-panel">
        <div className="gallery-main-view">
          <PlaceholderImage
            src={activeImage.url}
            alt={activeImage.alt || product.name}
            aspectRatio="1 / 1"
            priority={false}
            category={product.categoryName}
          />

          {/* Fullscreen Lightbox Trigger */}
          <button
            type="button"
            className="gallery-zoom-badge"
            onClick={() => onOpenLightbox(product, activeImageIndex)}
            aria-label={`Enlarge high-resolution image for ${product.name}`}
          >
            <Maximize2 size={13} />
            <span>Zoom</span>
          </button>

          {/* Image Angle Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                className="gallery-nav-arrow gallery-nav-prev"
                onClick={handlePrevImage}
                aria-label="Previous photo angle"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                className="gallery-nav-arrow gallery-nav-next"
                onClick={handleNextImage}
                aria-label="Next photo angle"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}

          {/* Angle Counter */}
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.92)',
              border: '1px solid var(--color-border)',
              borderRadius: '20px',
              padding: '3px 10px',
              fontSize: '0.72rem',
              fontWeight: 600,
              color: 'var(--color-text-main)',
              zIndex: 2
            }}
          >
            Angle {activeImageIndex + 1} of {images.length}
          </div>
        </div>

        {/* Thumbnail Selector Strip */}
        {images.length > 1 && (
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Gallery Angles ({images.length} Views):
            </div>
            <div className="gallery-thumbnails-strip">
              {images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  type="button"
                  className={`gallery-thumb-btn ${activeImageIndex === idx ? 'active' : ''}`}
                  onClick={() => setActiveImageIndex(idx)}
                  aria-label={`Select angle ${idx + 1}: ${img.alt || product.name}`}
                  title={img.alt || `Angle ${idx + 1}`}
                >
                  <PlaceholderImage
                    src={img.url}
                    alt={img.alt || product.name}
                    aspectRatio="1 / 1"
                    category={product.categoryName}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right: Description, Specifications & Variant Purchase */}
      <div className="gallery-info-panel">
        <div>
          {/* Category, Collection & Stock Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
            <span className="badge badge-neutral" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.68rem' }}>
              {product.categoryName}
            </span>
            <span className="badge badge-gold" style={{ fontSize: '0.68rem' }}>
              {product.collectionName}
            </span>
            {product.lifecycle === 'clearance' ? (
              <span className="badge badge-danger">Clearance</span>
            ) : totalAvailable <= 0 ? (
              <span className="badge badge-danger">Sold Out</span>
            ) : totalAvailable <= 5 ? (
              <span className="badge badge-warning">Low Stock ({totalAvailable} left)</span>
            ) : product.isNew ? (
              <span className="badge badge-burgundy">New Design</span>
            ) : null}
          </div>

          {/* Product Title & Code */}
          <h2 className="gallery-product-title">
            <Link href={`/products/${product.slug}`}>
              {product.name}
            </Link>
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
              SKU: {currentVariant.sku}
            </span>
            <span style={{ color: 'var(--color-border)' }}>•</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', color: '#B38B3F' }}>
              <span>★</span>
              <span style={{ fontWeight: 600 }}>{product.rating}</span>
              <span style={{ color: 'var(--color-text-muted)' }}>({product.reviewCount} atelier reviews)</span>
            </div>
          </div>

          {/* Price & Unit */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '16px' }}>
            <span style={{ fontSize: '1.45rem', fontWeight: 600, color: 'var(--color-burgundy)', fontFamily: 'var(--font-serif)' }}>
              {formatCurrency(product.priceMinor, product.currency)}
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
              {product.salesUnit === 'pair' ? 'Sold as Pair' : product.salesUnit === 'set' ? 'Set' : 'Per Piece'} • Inclusive of all taxes
            </span>
          </div>

          {/* Full Artisanal Description */}
          <p className="gallery-description-text">
            {product.description}
          </p>

          {/* Materials & Craft Specifications */}
          <div className="gallery-specs-grid">
            <div className="gallery-spec-item">
              <span className="gallery-spec-label">
                <Sparkles size={12} color="var(--color-gold)" /> Materials & Finish
              </span>
              <span className="gallery-spec-value">{product.materials}</span>
            </div>
            <div className="gallery-spec-item">
              <span className="gallery-spec-label">
                <Ruler size={12} color="var(--color-gold)" /> Dimensions & Weight
              </span>
              <span className="gallery-spec-value">{product.dimensions}</span>
            </div>
            <div className="gallery-spec-item" style={{ gridColumn: '1 / -1' }}>
              <span className="gallery-spec-label">
                <ShieldCheck size={12} color="var(--color-gold)" /> Care Guidelines
              </span>
              <span className="gallery-spec-value" style={{ fontSize: '0.8rem', color: '#5C5450' }}>{product.careInstructions}</span>
            </div>
          </div>
        </div>

        {/* Variant Selection & Add to Bag */}
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
          {/* Variant Selector */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-main)' }}>
                Variant / Size:
              </span>
              <span style={{ fontSize: '0.78rem', color: isOutOfStock ? 'var(--color-danger)' : availableUnits <= 5 ? '#B38B3F' : 'var(--color-success)', fontWeight: 600 }}>
                {isOutOfStock ? '✕ Out of Stock' : availableUnits <= 5 ? `⚠️ Low Vault Stock (${availableUnits} left)` : `✓ ${availableUnits} units available`}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {product.variants.map((v, idx) => {
                const vStock = computeAvailableStock(v.sellable, v.reserved);
                const isSelected = selectedVariantIndex === idx;
                return (
                  <button
                    key={v.sku}
                    type="button"
                    onClick={() => {
                      setSelectedVariantIndex(idx);
                      if (quantity > vStock && vStock > 0) setQuantity(vStock);
                    }}
                    style={{
                      padding: '7px 14px',
                      borderRadius: 'var(--radius-xs)',
                      border: isSelected ? '2px solid var(--color-burgundy)' : '1px solid var(--color-border)',
                      backgroundColor: isSelected ? 'rgba(74, 21, 37, 0.05)' : '#FFFFFF',
                      color: isSelected ? 'var(--color-burgundy)' : 'var(--color-text-main)',
                      fontSize: '0.82rem',
                      fontWeight: isSelected ? 600 : 400,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>{v.colour || v.size}</span>
                    <span style={{ fontSize: '0.72rem', color: vStock > 0 ? 'var(--color-text-muted)' : 'var(--color-danger)' }}>
                      ({vStock > 0 ? `${vStock} avail` : 'sold out'})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Row: Quantity + Add to Bag + Wishlist */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Quantity Stepper */}
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', backgroundColor: '#FFFFFF' }}>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1 || isOutOfStock}
                style={{ width: '36px', height: '38px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1rem', color: 'var(--color-text-main)' }}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span style={{ width: '32px', textAlign: 'center', fontSize: '0.88rem', fontWeight: 600 }}>
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(availableUnits, q + 1))}
                disabled={quantity >= availableUnits || isOutOfStock}
                style={{ width: '36px', height: '38px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1rem', color: 'var(--color-text-main)' }}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            {/* Add to Bag Button */}
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              style={{
                flex: 1,
                minWidth: '160px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                backgroundColor: addedFeedback ? 'var(--color-success)' : undefined
              }}
            >
              {addedFeedback ? (
                <>
                  <Check size={16} />
                  <span>Added to Bag!</span>
                </>
              ) : isOutOfStock ? (
                <span>Sold Out</span>
              ) : (
                <>
                  <ShoppingBag size={16} />
                  <span>Add to Bag</span>
                </>
              )}
            </button>

            {/* Wishlist Button */}
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => toggleWishlist(product)}
              style={{
                height: '40px',
                width: '44px',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isWishlisted ? 'var(--color-burgundy)' : 'var(--color-text-main)',
                borderColor: isWishlisted ? 'var(--color-burgundy)' : 'var(--color-border)'
              }}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
            >
              <Heart size={18} fill={isWishlisted ? 'var(--color-burgundy)' : 'none'} />
            </button>

            {/* Link to Full PDP */}
            <Link
              href={`/products/${product.slug}`}
              className="btn btn-outline"
              style={{
                height: '40px',
                fontSize: '0.82rem',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>Full Details</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

/**
 * All Products Page Content
 */
function AllProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read URL query params
  const initialCategory = searchParams.get('category') || 'all';
  const initialCollection = searchParams.get('collection') || 'all';
  const initialPrice = searchParams.get('price') || 'all';
  const initialSearch = searchParams.get('q') || '';
  const initialSort = searchParams.get('sort') || 'featured';
  const initialView = searchParams.get('view') || 'gallery'; // Default to Gallery & Story View!

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedCollection, setSelectedCollection] = useState(initialCollection);
  const [selectedPrice, setSelectedPrice] = useState(initialPrice);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState(initialSort);
  const [viewMode, setViewMode] = useState(initialView);
  const [liveProducts, setLiveProducts] = useState(PRODUCTS.filter((p) => p.publishState !== 'draft' && p.lifecycle !== 'archived'));

  // Modals state
  const [lightboxState, setLightboxState] = useState({ isOpen: false, product: null, imageIndex: 0 });
  const [quickViewProduct, setQuickViewProduct] = useState(null);

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

  // Sync state if URL searchParams change
  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || 'all');
    setSelectedCollection(searchParams.get('collection') || 'all');
    setSelectedPrice(searchParams.get('price') || 'all');
    setSearchQuery(searchParams.get('q') || '');
    setSortBy(searchParams.get('sort') || 'featured');
    if (searchParams.get('view')) {
      setViewMode(searchParams.get('view'));
    }
  }, [searchParams]);

  // Sync URL parameters
  const syncUrlParams = (newFilters) => {
    const params = new URLSearchParams();
    const cat = newFilters.category !== undefined ? newFilters.category : selectedCategory;
    const col = newFilters.collection !== undefined ? newFilters.collection : selectedCollection;
    const pri = newFilters.price !== undefined ? newFilters.price : selectedPrice;
    const q = newFilters.search !== undefined ? newFilters.search : searchQuery;
    const sort = newFilters.sort !== undefined ? newFilters.sort : sortBy;
    const view = newFilters.view !== undefined ? newFilters.view : viewMode;

    if (cat && cat !== 'all') params.set('category', cat);
    if (col && col !== 'all') params.set('collection', col);
    if (pri && pri !== 'all') params.set('price', pri);
    if (q && q.trim()) params.set('q', q.trim());
    if (sort && sort !== 'featured') params.set('sort', sort);
    if (view && view !== 'gallery') params.set('view', view);

    const queryStr = params.toString();
    router.replace(`/products${queryStr ? `?${queryStr}` : ''}`, { scroll: false });
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

  const handleViewChange = (mode) => {
    setViewMode(mode);
    syncUrlParams({ view: mode });
  };

  const resetAllFilters = () => {
    setSelectedCategory('all');
    setSelectedCollection('all');
    setSelectedPrice('all');
    setSearchQuery('');
    setSortBy('featured');
    router.replace('/products', { scroll: false });
  };

  // Filter & sort catalogue items
  const filteredProducts = useMemo(() => {
    let result = [...liveProducts];

    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (selectedCollection !== 'all') {
      if (selectedCollection === 'clearance') {
        result = result.filter((p) => p.lifecycle === 'clearance');
      } else {
        result = result.filter((p) => p.collectionType === selectedCollection);
      }
    }

    if (selectedPrice !== 'all') {
      if (selectedPrice === 'under_1500') {
        result = result.filter((p) => p.priceMinor < 150000);
      } else if (selectedPrice === '1500_3000') {
        result = result.filter((p) => p.priceMinor >= 150000 && p.priceMinor <= 300000);
      } else if (selectedPrice === 'above_3000') {
        result = result.filter((p) => p.priceMinor > 300000);
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p) => {
        const inName = p.name.toLowerCase().includes(q);
        const inDesc = p.description.toLowerCase().includes(q);
        const inCode = p.code.toLowerCase().includes(q);
        const inMat = p.materials?.toLowerCase().includes(q);
        const inSku = p.variants?.some((v) => v.sku.toLowerCase().includes(q));
        return inName || inDesc || inCode || inMat || inSku;
      });
    }

    if (sortBy === 'price_asc') {
      result.sort((a, b) => a.priceMinor - b.priceMinor);
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => b.priceMinor - a.priceMinor);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.launchDate) - new Date(a.launchDate));
    }

    return result;
  }, [selectedCategory, selectedCollection, selectedPrice, searchQuery, sortBy, liveProducts]);

  const activeFiltersCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedCollection !== 'all' ? 1 : 0) +
    (selectedPrice !== 'all' ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  // Lightbox handlers
  const openLightbox = (product, imageIndex = 0) => {
    setLightboxState({ isOpen: true, product, imageIndex });
  };

  const closeLightbox = () => {
    setLightboxState({ isOpen: false, product: null, imageIndex: 0 });
  };

  return (
    <div style={{ padding: 'var(--space-6) 0 var(--space-16)' }}>
      {/* Lightbox Fullscreen Modal */}
      {lightboxState.isOpen && lightboxState.product && (
        <div className="modal-backdrop" onClick={closeLightbox}>
          <div
            style={{
              position: 'relative',
              maxWidth: '920px',
              width: '100%',
              backgroundColor: '#1E1B18',
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden',
              boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '24px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeLightbox}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                color: '#FFFFFF',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10
              }}
              aria-label="Close high-resolution zoom"
            >
              <X size={20} />
            </button>

            <div style={{ width: '100%', maxHeight: '72vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lightboxState.product.images[lightboxState.imageIndex]?.url || '/images/categories/earrings.svg'}
                alt={lightboxState.product.images[lightboxState.imageIndex]?.alt || lightboxState.product.name}
                style={{ maxHeight: '70vh', maxWidth: '100%', objectFit: 'contain', borderRadius: 'var(--radius-xs)' }}
              />

              {lightboxState.product.images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setLightboxState((prev) => ({
                        ...prev,
                        imageIndex: prev.imageIndex > 0 ? prev.imageIndex - 1 : prev.product.images.length - 1
                      }));
                    }}
                    className="gallery-nav-arrow gallery-nav-prev"
                    style={{ left: '16px' }}
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLightboxState((prev) => ({
                        ...prev,
                        imageIndex: prev.imageIndex < prev.product.images.length - 1 ? prev.imageIndex + 1 : 0
                      }));
                    }}
                    className="gallery-nav-arrow gallery-nav-next"
                    style={{ right: '16px' }}
                    aria-label="Next image"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            <div style={{ width: '100%', marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#FFFFFF', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', color: '#FFFFFF', margin: 0 }}>
                  {lightboxState.product.name}
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#D3C4C8', margin: '4px 0 0' }}>
                  {lightboxState.product.images[lightboxState.imageIndex]?.alt || `Gallery Angle ${lightboxState.imageIndex + 1}`}
                </p>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--color-gold)', fontWeight: 600 }}>
                Photo {lightboxState.imageIndex + 1} of {lightboxState.product.images.length}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick View Modal for Grid Mode */}
      {quickViewProduct && (
        <div className="modal-backdrop" onClick={() => setQuickViewProduct(null)}>
          <div className="modal-dialog-luxury" onClick={(e) => e.stopPropagation()}>
            <div style={{ position: 'sticky', top: 0, right: 0, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', backgroundColor: '#FFFFFF', zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-burgundy)', fontWeight: 600 }}>
                  Atelier Quick View
                </span>
                <span style={{ color: 'var(--color-border)' }}>•</span>
                <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                  Full Gallery & Craft Story
                </span>
              </div>
              <button
                type="button"
                onClick={() => setQuickViewProduct(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--color-text-main)' }}
                aria-label="Close Quick View"
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '20px' }}>
              <GalleryShowcaseItem product={quickViewProduct} onOpenLightbox={openLightbox} />
            </div>
          </div>
        </div>
      )}

      <div className="container-storefront">
        {/* Luxury Page Header */}
        <div style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto var(--space-8)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 14px', borderRadius: '20px', backgroundColor: 'rgba(74, 21, 37, 0.06)', color: 'var(--color-burgundy)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
            <Sparkles size={13} /> NISHKÈA Fine Jewellery & Hair Adornments
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 400, color: 'var(--color-text-main)', letterSpacing: '-0.02em', marginBottom: '10px' }}>
            All Products & Artisan Gallery
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--color-text-muted)', lineHeight: 1.6, maxWidth: '640px', margin: '0 auto' }}>
            Explore every handcrafted creation in our atelier. Experience multi-angle high-resolution gallery photography, complete material provenance, and live vault stock.
          </p>
        </div>

        {/* View Mode & Filter Control Bar */}
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            padding: 'var(--space-4) var(--space-6)',
            marginBottom: 'var(--space-8)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          {/* Top Bar: Search, View Mode Toggle, and Sorting */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'var(--space-4)',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: 'var(--space-4)',
              borderBottom: '1px solid var(--color-border)'
            }}
          >
            {/* Search Input */}
            <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '380px' }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)',
                  pointerEvents: 'none'
                }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search jewellery, pearls, alloys, SKU..."
                aria-label="Search all products"
                style={{
                  width: '100%',
                  padding: '9px 36px 9px 36px',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: '#FAF8F6',
                  fontSize: '0.85rem',
                  outline: 'none',
                  color: 'var(--color-text-main)'
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => handleSearchChange('')}
                  aria-label="Clear search"
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-muted)',
                    cursor: 'pointer',
                    padding: '2px'
                  }}
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* View Mode Switcher (Gallery & Story vs Boutique Grid) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                View Mode:
              </span>
              <div className="view-mode-toggle" role="group" aria-label="Product display mode">
                <button
                  type="button"
                  className={`view-mode-btn ${viewMode === 'gallery' ? 'active' : ''}`}
                  onClick={() => handleViewChange('gallery')}
                  aria-label="Gallery and Story view"
                  title="Expansive gallery photos and complete descriptions"
                >
                  <Layers size={15} />
                  <span>Gallery & Story</span>
                </button>
                <button
                  type="button"
                  className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => handleViewChange('grid')}
                  aria-label="Boutique Grid view"
                  title="Multi-column product grid with quick gallery flip"
                >
                  <LayoutGrid size={15} />
                  <span>Boutique Grid</span>
                </button>
              </div>
            </div>

            {/* Sort Select */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label htmlFor="all-products-sort" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                Sort:
              </label>
              <select
                id="all-products-sort"
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                style={{
                  padding: '7px 28px 7px 12px',
                  fontSize: '0.82rem',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--color-text-main)',
                  cursor: 'pointer'
                }}
              >
                <option value="featured">Featured Atelier Pieces</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Customer Rating</option>
                <option value="newest">Newest Releases</option>
              </select>
            </div>
          </div>

          {/* Bottom Filter Strip: Category Chips & Collection Filters */}
          <div
            style={{
              paddingTop: 'var(--space-4)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'var(--space-3)',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            {/* Category Tabs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              <button
                type="button"
                onClick={() => handleCategoryChange('all')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '16px',
                  fontSize: '0.78rem',
                  fontWeight: selectedCategory === 'all' ? 600 : 500,
                  backgroundColor: selectedCategory === 'all' ? 'var(--color-burgundy)' : '#FAF8F6',
                  color: selectedCategory === 'all' ? '#FFFFFF' : 'var(--color-text-main)',
                  border: `1px solid ${selectedCategory === 'all' ? 'var(--color-burgundy)' : 'var(--color-border)'}`,
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                All Categories ({PRODUCTS.length})
              </button>
              {CATEGORIES.map((cat) => {
                const count = PRODUCTS.filter((p) => p.category === cat.slug).length;
                const isSelected = selectedCategory === cat.slug;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryChange(cat.slug)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '16px',
                      fontSize: '0.78rem',
                      fontWeight: isSelected ? 600 : 500,
                      backgroundColor: isSelected ? 'var(--color-burgundy)' : '#FAF8F6',
                      color: isSelected ? '#FFFFFF' : 'var(--color-text-main)',
                      border: `1px solid ${isSelected ? 'var(--color-burgundy)' : 'var(--color-border)'}`,
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    {cat.name} ({count})
                  </button>
                );
              })}
            </div>

            {/* Price & Collection Filters */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                value={selectedCollection}
                onChange={(e) => handleCollectionChange(e.target.value)}
                style={{
                  padding: '5px 10px',
                  fontSize: '0.76rem',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: '#FFFFFF',
                  cursor: 'pointer'
                }}
                aria-label="Filter by collection"
              >
                <option value="all">All Collections</option>
                <option value="monthly_trend">30-Day Trend Capsule</option>
                <option value="permanent">Signature Permanent</option>
                <option value="clearance">Clearance Archive</option>
              </select>

              <select
                value={selectedPrice}
                onChange={(e) => handlePriceChange(e.target.value)}
                style={{
                  padding: '5px 10px',
                  fontSize: '0.76rem',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: '#FFFFFF',
                  cursor: 'pointer'
                }}
                aria-label="Filter by price bracket"
              >
                <option value="all">All Price Ranges</option>
                <option value="under_1500">Under ₹1,500</option>
                <option value="1500_3000">₹1,500 – ₹3,000</option>
                <option value="above_3000">Above ₹3,000</option>
              </select>

              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.75rem',
                    color: 'var(--color-burgundy)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  <RotateCcw size={12} /> Reset ({activeFiltersCount})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Product Results Count & Active Mode Indicator */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
            Showing <strong style={{ color: 'var(--color-text-main)' }}>{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'creation' : 'creations'} in {viewMode === 'gallery' ? 'Gallery & Story Mode' : 'Boutique Grid Mode'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-success)' }} />
            Zero-overselling real-time vault gate active
          </div>
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div
            style={{
              padding: '60px 20px',
              textAlign: 'center',
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              margin: '20px 0'
            }}
          >
            <SlidersHorizontal size={36} color="var(--color-text-muted)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '8px' }}>
              No Jewellery Matches Your Selection
            </h3>
            <p style={{ color: 'var(--color-text-muted)', maxWidth: '420px', margin: '0 auto 20px', fontSize: '0.9rem' }}>
              We could not find any creations matching your search keyword or selected filter combination.
            </p>
            <button type="button" onClick={resetAllFilters} className="btn btn-outline">
              Clear All Filters & Reset
            </button>
          </div>
        )}

        {/* VIEW MODE 1: Gallery & Story View (The Full Requested Gallery Option) */}
        {viewMode === 'gallery' && filteredProducts.length > 0 && (
          <div className="gallery-showcase-container">
            {filteredProducts.map((product) => (
              <GalleryShowcaseItem
                key={product.id}
                product={product}
                onOpenLightbox={openLightbox}
              />
            ))}
          </div>
        )}

        {/* VIEW MODE 2: Boutique Grid Mode with In-Card Gallery Dots & Quick View */}
        {viewMode === 'grid' && filteredProducts.length > 0 && (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>
        )}

        {/* Atelier Quality Assurance Seal */}
        <div
          style={{
            marginTop: 'var(--space-16)',
            padding: 'var(--space-8)',
            backgroundColor: '#FAF8F6',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 'var(--space-6)',
            textAlign: 'center'
          }}
        >
          <div>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(74, 21, 37, 0.08)', color: 'var(--color-burgundy)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Sparkles size={20} />
            </div>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 600, marginBottom: '6px' }}>18K Gold Micron Bath</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.5, margin: 0 }}>
              Heavy electroplate and PVD finishing engineered for everyday sheen and tarnish resistance.
            </p>
          </div>
          <div>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(74, 21, 37, 0.08)', color: 'var(--color-burgundy)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <ShieldCheck size={20} />
            </div>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 600, marginBottom: '6px' }}>Hypoallergenic Standards</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.5, margin: 0 }}>
              Lead, nickel and cadmium compliant. Titanium and surgical grade alloy contact posts.
            </p>
          </div>
          <div>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(74, 21, 37, 0.08)', color: 'var(--color-burgundy)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <ShoppingBag size={20} />
            </div>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 600, marginBottom: '6px' }}>Zero-Overselling Guarantee</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.5, margin: 0 }}>
              Every order is backed by transactional batch reservations directly from our vaulted inventory.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AllProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="container-storefront" style={{ padding: '80px 16px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--color-burgundy)' }}>
            <Sparkles size={18} />
            <span>Loading Atelier Catalogue...</span>
          </div>
        </div>
      }
    >
      <AllProductsContent />
    </Suspense>
  );
}
