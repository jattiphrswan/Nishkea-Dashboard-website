# Development nodes and dependencies
Each node follows prompt → implement → verify → fix → record. A node is complete only when its acceptance checks pass; independent branches may be planned but do not skip dependencies.

| Node | Deliverable | Depends on | Completion gate |
|---|---|---|---|
| 1 | documentation foundation | — | complete, consistent requirements and pending decisions |
| 2 | JS Next.js scaffold, tokens, responsive shells | 1 | build/lint + visual/accessibility checks |
| 3 | database, migrations, authentication, permissions | 2 | persistence and denied-access tests |
| 4 | catalogue, variants, approved media, imports | 3 | unique SKU/options and publish validation |
| 5 | inventory ledger, receipts, counts, reservations | 4 | concurrency, reconciliation and audit tests |
| 6 | monthly reviews, ageing, clearance/reorder | 5 | date/idempotency and historical-age checks |
| 7 | complete storefront, catalogue and product pages | 4 | responsive, SEO, filter and variant checks |
| 8 | checkout, payments, shipping and returns | 5,7 | verified webhook and full order/return tests |
| 9 | suppliers, purchase approvals and partial receipts | 5 | ordered/received/returned quantities reconcile |
| 10 | CRM, tasks, team and support | 3,8 | scopes, follow-ups and task recurrence verified |
| 11 | client accounts, self-service portal, tracking, password security & contact enquiries | 3,8,10 | client session isolation, tracking stepper, password verification gate, contact CRM lead sync |
| 12 | payment/expense records and business reports | 6,8,9 | balances and metric definitions reconcile |
| 13 | grounded public AI assistant | 7,8,11 | live lookups, privacy, injection/fallback checks |
| 14 | permission-scoped staff assistant (Operations Copilot) | 10,12,13 | private retrieval authorization & RBAC cost isolation verified (COMPLETE) |
| 15 | production preparation, security hardening & disaster recovery | 6–14 | release checklist, security headers, backup/restore test verified (COMPLETE) |
| 16 | WooCommerce-style product editor, media studio & variant matrix | 4,7,9 | full product CRUD, attribute builder, gallery reorder, and live publishing validation (COMPLETE) |

Catalogue UI can be developed with fixtures before Node 4 but is not considered connected until its gate passes. All operational dashboard modules remain essential planned scope, not placeholder completion. Node 16 provides full WooCommerce-parity backend product editing (general stories, integer pricing, tax classes, inventory limits, shipping dimensions, attributes/variations, multi-angle media galleries, and non-destructive soft-archive deletion).

