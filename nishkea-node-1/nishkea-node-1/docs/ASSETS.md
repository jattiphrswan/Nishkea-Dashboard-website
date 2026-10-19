# NISHKÈA — Asset Checklist and Media Replacement Guide

## Image Specifications & File Paths

All media paths are organized under `/public/images/`. When replacing placeholders with business-approved photography, maintain the exact recommended dimensions and aspect ratios to prevent layout shifts.

| Asset Type | Local Path | Recommended Dimensions | Aspect Ratio | Format | Current Status |
|---|---|---|---|---|---|
| **Brand Logo** | `/public/images/brand/logo.svg` | 320 × 80 px | 4:1 | Vector SVG / Transparent PNG | Provisional Wordmark |
| **Hero Desktop** | `/public/images/hero/hero-desktop.svg` | 1600 × 750 px | ~2.13:1 | WebP / JPEG (Max 250KB) | Editorial Placeholder |
| **Hero Mobile** | `/public/images/hero/hero-mobile.svg` | 750 × 900 px | 5:6 | WebP / JPEG (Max 180KB) | Editorial Placeholder |
| **Category: Earrings** | `/public/images/categories/earrings.svg` | 600 × 600 px | 1:1 | WebP / PNG / SVG | Curated Vector Graphic |
| **Category: Rings** | `/public/images/categories/rings.svg` | 600 × 600 px | 1:1 | WebP / PNG / SVG | Curated Vector Graphic |
| **Category: Necklaces** | `/public/images/categories/necklaces.svg` | 600 × 600 px | 1:1 | WebP / PNG / SVG | Curated Vector Graphic |
| **Category: Hair** | `/public/images/categories/hair-accessories.svg` | 600 × 600 px | 1:1 | WebP / PNG / SVG | Curated Vector Graphic |
| **Category: Nose Rings** | `/public/images/categories/nose-rings.svg` | 600 × 600 px | 1:1 | WebP / PNG / SVG | Curated Vector Graphic |
| **Editorial Feature** | `/public/images/editorial/collection-autumn.svg` | 1200 × 700 px | ~1.71:1 | WebP / JPEG (Max 220KB) | Autumn Trend Campaign |

## Photography Guidelines
1. **Background**: Neutral warm grey (`#F7F5F2`) or ivory canvas; no harsh contrasting patterns.
2. **Lighting**: Soft diffused studio lighting highlighting gemstone facets and micron gold tone reflections.
3. **Scale & Worn Shots**: Model shots must have appropriate usage licensing and clearly display product scale against earlobe, collarbone, or hand.
4. **Color Authenticity**: Variants (e.g. Antique Gold vs Rhodium Silver vs Rose Gold) must be accurately color balanced before production publication.
5. **Fallbacks**: `src/components/ui/PlaceholderImage.js` ensures that if an asset file is unavailable, a branded vector placeholder renders immediately without broken-image icons or cumulative layout shifts.
