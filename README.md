# NISHKÈA — Haute Joaillerie & Artisanal Accessories Storefront + Operations Suite

**Current Status:** Application Architecture & All Core Nodes (1 through 17) **COMPLETE & PASS**.
**Test Suite:** 14 Suites / 525 Unit & Integration Assertions Passing (`npm test`).
**Production Build:** 59 Static & Dynamic App Router Pages Compiled Successfully (`npm run build`).

NISHKÈA is a luxury animated jewellery and accessories storefront paired with an enterprise backoffice operations centre built with **Next.js 15 (App Router)**, **React 19**, and vanilla **JavaScript** (strictly `.js` / `.jsx`, no TypeScript).

---

## 🏛️ Architecture & Implemented Capabilities

### 1. Luxury Public Storefront (`src/app/(storefront)/`)
- **Atmospheric Brand Hero**: Deep liquid crimson silk velvet drape, 18K gold curb chain, emerald-cut ruby pendant, and high-contrast editorial typography (`LIGHT, RENDERED ETERNAL.`).
- **Dynamic Glassmorphic Header & Category Drawer**: Scroll-responsive header transitioning from transparent hero overlay to blurred burgundy glass with Rubans-style multi-category drawer navigation.
- **Micro-Interactions & React Bits Animations**:
  - `StarBorder`: Canvas stardust ray tracer on key call-to-actions.
  - `OptionWheel`: 3D curved aesthetic wheel showcasing 8 jewellery mood collections.
  - `BorderGlow`: Multi-color cursor proximity illumination on category cards.
  - `LuxuryCursor`: 18K gold micro-dot with spring lerp trailing aura follower.
- **Festive Editorial Bento Showcase**: High-impact campaign cards for Silver, Gold, and Diamond edits with smooth hover zoom physics.
- **Atelier Concierge Haute Joaillerie Dock & Banner**: Edge-to-edge full-bleed CTA banner with bespoke frosted glass dropdowns.
- **Equal-Height Product Cards**: Dynamic in-card gallery dot navigation, vault stock badges, clamped titles, and bottom-aligned pricing meta.
- **Client Atelier Self-Service Portal (`/account`)**: Order tracking with courier timelines, profile management, and PBKDF2-gated password rotation.
- **Grounded Maison Concierge Chatbot (`/api/chat`)**: Allowlisted read assistant querying live stock and sizes without leaking supplier margins or internal finances.

### 2. Operations Centre Dashboard (`src/app/dashboard/`)
- **Staff Authentication & RBAC**: Deny-by-default role authorization (Owner, Manager, Inventory Staff, Sales Support, Accounts) isolating supplier costs and gross margins.
- **WooCommerce-Style Advanced Product Studio (Node 16)**: Multi-attribute variation matrix generator, integer paise pricing, festival sale scheduling, low-stock thresholds, and non-destructive soft-archive deletion.
- **Transactional Inventory Engine (Node 5)**: Zero-oversell equation (`Available = Sellable − Reserved`), FIFO batch depletion, TTL cart reservations, and signed immutable movement ledgers.
- **30-Day Trend Review Engine (Node 6)**: Idempotent queue evaluation, sell-through rate calculation ($\text{Sold} / \text{Opening} + \text{Receipts}$), and lifecycle transitions.
- **Procurement & Goods Receipt (Node 9)**: Artisan guild directory, MOQ validation, high-value approval thresholds ($\ge \text{₹1,00,000}$), and bounded receipt tracking.
- **CRM & B2B Pipeline (Node 10)**: Retail vs Wholesale segmentation, lead pipeline stages, and idempotent recurring task generator.
- **Financial Ledgers & Commercial Margins (Node 12)**: Non-inferred receipts, supplier disbursements, operating overheads, FIFO COGS, and audit-ready CSV exports.
- **Operations Copilot (Node 14)**: Natural-language assistant for authenticated staff with strict state mutation prohibitions and RBAC scoping.
- **System Health Diagnostics (Node 15)**: Live runtime diagnostics endpoint (`/api/health`) without credential exposure.

---

## 🛠️ Verification & Quality Assurance

```bash
# 1. Run all 13 test suites (485 assertions)
npm test

# 2. Run ESLint checks
npm run lint

# 3. Compile production build (55 routes)
npm run build

# 4. Verify database backup & disaster recovery
npm run db:backup-test

# 5. Check Cloud PostgreSQL connection readiness
npm run db:verify
```

---

## 🚀 Cloud Deployment & Database Provisioning

- **Database**: Cloud PostgreSQL on Neon Serverless or Supabase (`npm run db:setup`).
- **Hosting**: Configured for Vercel via `vercel.json` targeting Mumbai (`bom1`) and Singapore (`sin1`) edge regions.
- See detailed step-by-step instructions in [docs/DEPLOYMENT.md](file:///c:/Users/SkyFish/OneDrive%20-%20SkyFish%20Private%20Limited/New%20folder/project/nishkea/docs/DEPLOYMENT.md).
