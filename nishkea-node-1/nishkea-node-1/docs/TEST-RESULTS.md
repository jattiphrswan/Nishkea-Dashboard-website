# NISHKÈA — Verification and Test Results (Node 2)

## Acceptance Test Suite

| Test Identifier | Category | Description | Status | Observed Result |
|---|---|---|:---:|---|
| **T01-BUILD** | Build & Compilation | `npm run build` compiles App Router without errors | **PASS** | 10 routes compiled in 3.7s; zero errors or viewport warnings. |
| **T02-LINT** | Code Quality | `npm run lint` passes rules | **PASS** | `✔ No ESLint warnings or errors` across all JS/JSX files. |
| **T03-HEALTH** | Monitoring API | `/api/health` returns status and node identifier | **PASS** | Returns HTTP 200 with `node: "node-2-scaffold"` and unconnected services list. |
| **T04-ROUTES** | Storefront | All required storefront routes render (`/`, `/shop`, `/products/[slug]`, `/wishlist`, `/cart`) | **PASS** | All routes statically prerendered or server-rendered cleanly. |
| **T05-DASHBOARD** | Backoffice | `/dashboard` renders with separate layout and 11 modules | **PASS** | Desktop sidebar, mobile collapsible drawer, and all 11 tabs verified. |
| **T06-FILTER-SORT**| Search & Filter | `/shop` category filters, search input, and sorting work | **PASS** | Filter updates product grid dynamically; empty search shows reset state. |
| **T07-CART-MATH** | Integrity | Cart subtotal arithmetic in integer minor units (paise) | **PASS** | Quantity changes update subtotal without floating-point inaccuracies. |
| **T08-CHECKOUT** | Boundary Check | Checkout disabled with informative dialog | **PASS** | Modal opens explaining Node 8 dependency; no ungrounded charge claims. |
| **T09-WISHLIST** | Storage | Wishlist persists via safe `localStorage` fallback | **PASS** | Item toggling works with try/catch error wrapper for SSR/private browsing. |
| **T10-CHATBOT** | Concierge AI | Deterministic demo assistant answers care and sizing | **PASS** | Answers grounded queries; rejects private cost/margin inquiries. |
| **T11-REDUCED-MOTION**| Accessibility | `prefers-reduced-motion` media query disables animations | **PASS** | CSS variable overrides transition durations to 0.01ms cleanly. |
| **T12-RESPONSIVE** | Responsive Layout | Breakpoints (360px, 390px, 768px, 1024px, 1440px) | **PASS** | Mobile navigation drawer, fluid grids, table horizontal scroll containers. |
| **T13-POSTGRES** | Database Persistence | Real database read/write queries | **NOT TESTED** | Scheduled for Node 3; mock fixture data used in Node 2. |
| **T14-PAYMENT-GATEWAY**| Payments | Live credit card or UPI transactions | **NOT TESTED** | Scheduled for Node 8; live payment adapters unconnected. |

---

## Limitations Remaining in Node 2
1. **Mock Data**: Products, orders, tasks, and inventory balances are fictional demo fixtures (`src/data/fixtures.js`).
2. **Persistence**: Cart and wishlist persist only in the user's local browser storage; cart does not reserve physical stock.
3. **Database & Auth**: No PostgreSQL database or staff authentication exists yet (Node 3).
4. **Media Assets**: Images use scalable SVG vector placeholders pending business delivery of high-resolution product photography.
