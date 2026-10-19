# NISHKÈA — Asset Checklist and Media Replacement Guide

## Image Specifications & File Paths

All media paths are organized under `/public/images/`.

| Asset Type | Local Path | Recommended Dimensions | Aspect Ratio | Current Status |
|---|---|---|---|---|
| **Brand Logo** | `/public/images/brand/logo.svg` | 320 × 80 px | 4:1 | Wordmark |
| **Hero Desktop/Mobile** | `/public/images/hero/1.png` | 1600 × 750 px | ~2.13:1 | High-Res Editorial Photography |
| **Alternate Hero 2** | `/public/images/hero/2.png` | 1600 × 750 px | ~2.13:1 | High-Res Editorial Photography |
| **Alternate Hero 3** | `/public/images/hero/3.png` | 1600 × 750 px | ~2.13:1 | High-Res Editorial Photography |
| **Editorial Feature** | `/public/images/editorial/1.png` | 1200 × 700 px | ~1.71:1 | Trend Collection Photography |
| **Product: Aurelia Chandelier** | `/public/images/prodcuts/earring 1.png` | 1:1 Square | 1:1 | High-Res Product Photography |
| **Product: Celeste Solitaire** | `/public/images/prodcuts/ring-1.png` | 1:1 Square | 1:1 | High-Res Product Photography |
| **Product: Nocturne Velvet Choker** | `/public/images/prodcuts/neackless-1.png` | 1:1 Square | 1:1 | High-Res Product Photography |
| **Product: Seraphina Scrunchie** | `/public/images/prodcuts/scrunie.png` | 1:1 Square | 1:1 | High-Res Product Photography |
| **Product: Astrid Huggie Hoops** | `/public/images/prodcuts/Gold Hoops on Oxblood Silk.png` | 1:1 Square | 1:1 | High-Res Product Photography |
| **Product: Valeria Wave Band** | `/public/images/prodcuts/ring-2.png` | 1:1 Square | 1:1 | High-Res Product Photography |
| **Product: Solis Medallion Chain** | `/public/images/prodcuts/neakless-2.png` | 1:1 Square | 1:1 | High-Res Product Photography |
| **Category Icons** | `/public/images/categories/*.svg` | 600 × 600 px | 1:1 | Curated Vector Graphics |

## Photography Guidelines
1. **Background**: Neutral warm grey (`#F7F5F2`) or ivory canvas; no harsh contrasting patterns.
2. **Lighting**: Soft diffused studio lighting highlighting gemstone facets and micron gold tone reflections.
3. **Scale & Worn Shots**: Model shots must have appropriate usage licensing and clearly display product scale against earlobe, collarbone, or hand.
4. **Color Authenticity**: Variants (e.g. Antique Gold vs Rhodium Silver vs Rose Gold) must be accurately color balanced before production publication.
5. **Fallbacks**: `src/components/ui/PlaceholderImage.js` ensures that if an asset file is unavailable, a branded vector placeholder renders immediately without broken-image icons or cumulative layout shifts.
