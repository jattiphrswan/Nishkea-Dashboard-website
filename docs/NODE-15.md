# Node 15: WooCommerce-Style Advanced Product Editor, Media Studio & Variant Matrix (Future Node Specification)

## 1. Executive Summary & Objective
Per user request, **Node 15** establishes full feature parity with WordPress / WooCommerce product management directly inside the NISHKÈA Operations Centre dashboard. It enables non-technical catalogue managers to draft, edit, customize, price, bundle, and publish artisanal jewellery designs without touching static code files or raw SQL databases.

---

## 2. WooCommerce-Style Feature Breakdown & Tabs

### Tab 1: General & Editorial Story
- **Product Title**: Display name shown across the boutique storefront, search index, and invoices.
- **Permalink / URL Slug**: Human-readable unique SEO slug (e.g., `/products/aurelia-filigree-chandelier-drops`).
- **Product Type**:
  - *Simple Product*: Single variant piece with uniform stock and pricing.
  - *Variable Product*: Multi-attribute matrix (metals, ring sizes, chain lengths, gemstone colors).
- **Short Description**: Storefront teaser summary appearing next to the hero gallery in quick views and cart drawers.
- **Editorial Narrative & Provenance**: Rich text narrative detailing regional artisan craft history (Kundan, Minakari, Filigree), historical inspiration, and styling notes.

### Tab 2: Pricing & Taxation
- **Regular Retail Price**: Explicit minor currency integer paist ($\text{pricePaise} = \text{priceRupees} \times 100$).
- **Sale Price & Scheduling**: Optional discounted price with start and end date calendars (e.g., Diwali or Akshaya Tritiya seasonal sale).
- **Tax Status & Class**: Standard 3% Indian Jewellery GST compliance with automated tax breakdown.

### Tab 3: Inventory & SKU Controls
- **Master Design SKU**: Unique base catalogue identifier (`NSK-EAR-001`).
- **Stock Management Toggle**:
  - *Catalogue Status*: `IN_STOCK`, `OUT_OF_STOCK`, `ON_BACKORDER` (Made-to-Order Artisan Intake).
  - *Physical Vault Synchronization*: Direct read-out of sellable on-hand physical units from the Node 5 Transactional Ledger.
- **Low Stock Threshold**: Triggers reorder warnings when available stock drops below threshold (default: 5 units).
- **Sold Individually Limit**: Enforces single-unit maximum purchase per checkout for rare high-value bridal showstoppers.

### Tab 4: Shipping, Dimensions & Physical Properties
- **Weight**: Exact item weight in grams or kilograms (critical for air courier rate calculations via BlueDart / Delhivery).
- **Dimensions**: Length, width, and height in centimeters.
- **Sales Packaging Unit**:
  - `pair`: Earrings standard.
  - `piece`: Rings, solitary pendants, hair clips.
  - `set`: Multi-piece bridal sets, scrunchie packs.
- **Fragility & Insured Transit Class**: Insured vault courier transit requirement.

### Tab 5: Attributes & Variations Matrix
- **Custom Artisanal Attributes**:
  - *Metal Purity & Finish*: 18k Micron Gold Plating, 22k Yellow Vermeil, Rhodium Silver, Oxidized Silver.
  - *Stone Setting*: Cubic Zirconia Marquise, Freshwater Pearls, Ruby Cabochon, Polki Kundan.
  - *Ring Sizing*: US 5, 6, 7, 8, 9 with millimeter circumference conversions.
- **Variation Generator**: Auto-generates variant matrix with dedicated variant SKUs, individual price overrides, and color swatch hex codes.

### Tab 6: Media Studio & Gallery Reordering
- **Featured Cover Image**: Primary portrait aspect ratio hero shot.
- **Multi-Angle Gallery Rail**:
  - Reorderable image thumbnail rail (Front, Model Styling, Macro Clasp Detail, Packaging Box).
  - Drag-and-drop ordering.
  - Alt-text and accessibility tags for SEO compliance.

### Tab 7: Linked Products, Cross-Sells & Upsells
- **"Complete the Look" (Upsells)**: Recommends matching chokers or naths for earring designs.
- **Cross-Sells**: Suggested accessory pairings in the checkout drawer (e.g., anti-tarnish storage pouches, silk travel rolls).

### Tab 8: Publishing & Collection Lifecycle
- **Publishing Status**: `draft`, `published`, `hidden` (private VIP link only).
- **Collection Dimension**: `monthly_trend` (30-day lifecycle review), `permanent`, `limited_edition`, `trial`.
- **30-Day Lifecycle Due Date**: Auto-calculated launch date $+ 30$ days for monthly review evaluation.
- **Reorder Policy**: `REVIEW_BASED`, `AUTOMATIC_RESTOCK`, `DISCONTINUE_ON_DEPLETION`.

---

## 3. Data Model & REST API Contracts
- `GET /api/products`: Full catalogue list with category, search, and lifecycle filters.
- `POST /api/products`: Create new design draft with validation gates.
- `GET /api/products/[id]`: Single product details including variants and specifications.
- `PUT /api/products/[id]`: Full or partial update of WooCommerce-style fields with server-side audit logging.
- `DELETE /api/products/[id]`: Soft-archive (preserves historical order link integrity).

---

## 4. Acceptance Criteria & Completion Gate
1. Non-technical staff can create and update products directly in the dashboard UI.
2. All retail prices remain strictly in integer minor currency units (`paise`) with no floating-point rounding errors.
3. Updating descriptions and stories immediately reflects on public storefront product pages and category grids without restarting the server.
4. Variants cannot be duplicated; each variant combination must have a distinct SKU.
5. All updates generate signed audit trail records in `audit_logs`.
