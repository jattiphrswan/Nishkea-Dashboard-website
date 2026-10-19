# Architecture — Node 2 Foundation Status

## Framework & Implementation Decision
- Next.js 15.5 App Router with React 19.
- Pure JavaScript (`.js` / `.jsx`) without TypeScript.
- Separated public storefront layout (`src/app/(storefront)/layout.js`) and private dashboard backoffice layout (`src/app/dashboard/layout.js`).

## Current Application Structure
```text
nishkea/
├── public/
│   └── images/
│       ├── brand/ (logo.svg)
│       ├── hero/ (hero-desktop.svg, hero-mobile.svg)
│       ├── categories/ (earrings, rings, necklaces, hair-accessories, nose-rings)
│       └── editorial/ (collection-autumn.svg)
├── src/
│   ├── app/
│   │   ├── (storefront)/
│   │   │   ├── layout.js
│   │   │   ├── page.js                     # /
│   │   │   ├── shop/page.js                # /shop
│   │   │   ├── products/[slug]/page.js     # /products/[slug]
│   │   │   ├── wishlist/page.js            # /wishlist
│   │   │   └── cart/page.js                # /cart
│   │   ├── dashboard/
│   │   │   ├── layout.js
│   │   │   └── page.js                     # /dashboard
│   │   ├── api/
│   │   │   ├── health/route.js             # /api/health
│   │   │   └── chat/route.js               # /api/chat
│   │   ├── layout.js                       # Root App Layout
│   │   ├── not-found.js                    # Custom 404
│   │   └── globals.css                     # Tokens, utilities & reset
│   ├── components/
│   │   ├── ui/PlaceholderImage.js
│   │   ├── storefront/ (Header, Footer, ProductCard)
│   │   └── chatbot/ChatWidget.js
│   ├── context/StoreContext.js             # Cart & Wishlist state
│   ├── data/fixtures.js                    # Fictional catalogue & metrics
│   └── lib/
│       ├── formatters.js                   # Currency, dates, stock math
│       └── server/ai-adapter.js            # Deterministic Concierge
├── docs/                                   # Architectural specifications
└── package.json
```

## System Boundaries & Security
- Client components are strictly isolated (`'use client'`) to interactive controls (drawers, filter tabs, cart operations, concierge panel).
- Server API boundaries (`/api/chat`, `/api/health`) protect internal data and prevent secret leakage into client bundles.
- Future services (PostgreSQL in Node 3, S3 storage in Node 4, Transactional ledger in Node 5, Webhook/checkout in Node 8, Live LLM in Node 12) remain decoupled adapters.
