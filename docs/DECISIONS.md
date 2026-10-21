# Decision Log

| ID | Decision | Status | Date | Notes / Impact |
|---|---|---|---|---|
| D01 | Next.js App Router + React, JavaScript only | REQUIRED | 2026-10-19 | Strict `.js`/`.jsx` files. No TypeScript configuration. |
| D02 | Public luxury storefront + private company dashboard | REQUIRED | 2026-10-19 | Separate layouts: `src/app/(storefront)/` vs `src/app/dashboard/`. |
| D03 | Burgundy/white reference; ivory/gold proposed accents | ADOPTED | 2026-10-19 | Implemented in `src/app/globals.css`. Contrast verified. |
| D04 | Separate design, variant and receipt-batch concepts | ADOPTED | 2026-10-19 | Modelled in `src/data/fixtures.js` and dashboard tables. |
| D05 | Review trendy designs after configurable 30 days | ADOPTED | 2026-10-19 | Demonstrated in `MONTHLY_REVIEW_QUEUE` and editorial story. |
| D06 | Shared transactional inventory service | PLANNED | 2026-10-19 | Core formula `Available = Sellable − Reserved` enforced in UI. |
| D07 | PostgreSQL relational storage | CONFIRMED | 2026-10-19 | Free Cloud PostgreSQL (Neon / Supabase) selected for Node 3. |
| D08 | Public AI read tools first; staff AI later | ADOPTED | 2026-10-19 | Grounded Concierge widget implemented with server adapter. |
| D09 | Full accounting/manufacturing not in initial scope | PENDING | 2026-10-19 | Gross margin definition recorded; statutory accounting deferred. |
| D10 | Brand display NISHKÈA from screenshot | CONFIRMED | 2026-10-19 | Clean SVG wordmark with "IT SUITS YOU !" tagline created. |
| D11 | Dependency Pinning for Node 2 | ADOPTED | 2026-10-19 | Next.js 15.5.x, React 19, Lucide Icons, ESLint 8.57 locked. |
| D12 | Integer Minor Currency Standard | ADOPTED | 2026-10-19 | All prices stored in paise (e.g. 249900 = ₹2,499.00) to prevent float errors. |
| D13 | Pure Vanilla CSS Design Tokens | ADOPTED | 2026-10-19 | CSS custom properties with `@media (prefers-reduced-motion: reduce)`. |
| D14 | Safe LocalStorage Fallback | ADOPTED | 2026-10-19 | Browser storage wrapped in try/catch to protect SSR and private browsing. |
| D15 | Inactive Mutation Disclosure | ADOPTED | 2026-10-19 | Unfinished backoffice actions show planned node status, not fake success. |
| D16 | CRM Segmentation & Task Recurrence Idempotency | ADOPTED | 2026-10-21 | Retail vs Wholesale segmentation with explicit separate marketing consent; automated tasks evaluate interval and generate strictly once per scheduled occurrence. |
| D17 | Client Session Isolation & PBKDF2 Password Gate | ADOPTED | 2026-10-21 | Dedicated `nishkea_customer_session` cookie isolated from staff auth; client password rotation strictly requires verifying valid current password before updating PBKDF2 hash. Storefront inquiries auto-create leads in CRM pipeline. |
| D18 | Commercial Gross Margin, Non-Inferred Receipts & Operational Surplus Standard | ADOPTED | 2026-10-21 | All financial ledgers track single explicit currency (INR) in integer paise. Customer receipts and supplier disbursements require explicit gateway/bank transaction references and never infer payment from order status. Net merchandise revenue strictly isolates 3% jewellery GST and customer refunds (`Gross − GST − Refunds`). Gross profit is calculated against FIFO allocated COGS. Operational surplus accounts for approved operating overheads, explicitly deferring statutory corporate tax and depreciation to corporate filings. |

