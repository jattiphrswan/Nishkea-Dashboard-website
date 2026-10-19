# Node 3 — Database, Migrations, Authentication & Permissions Summary

## Objective
Establish the relational PostgreSQL persistence layer (Free Cloud PostgreSQL: Neon / Supabase), database migration system, staff authentication, session management via secure HTTP-only cookies, and server-side RBAC permissions with denied-access test gates.

## Delivered in Node 3
1. **Relational Database Schema & Migrations**:
   - `database/migrations/001_initial_schema.sql` defining 30 core entities:
     - Merchandising: `categories`, `collections`, `product_designs`, `product_variants`.
     - Transactional Inventory: `stock_batches` (FIFO), `stock_movements`, `reservations`, `reservation_lines`.
     - Orders & Accounting: `orders`, `order_lines` (immutable price snapshots), integer minor units (`price_minor`).
     - Governance & Auditing: `roles`, `permissions`, `role_permissions`, `users`, `sessions`, `audit_logs`, `review_decisions`, `tasks`.
   - Constraints & Indexes: Non-negative prices/stock check constraints, unique constraints on SKUs, slugs, and session tokens.
   - Idempotent migration runner: `database/migrate.js` (`npm run db:migrate`).
   - Seeder script: `database/seed.js` (`npm run db:seed`) to seed default roles, permissions, staff accounts, and initial categories.

2. **Database Client Layer**:
   - `src/lib/server/db.js` providing connection pooling (`pg.Pool`), SSL auto-configuration for Neon and Supabase, parameterized query helper `query(text, params)`, transaction helper `withTransaction(callback)`, and connectivity health testing.
   - Built to handle serverless cold starts and graceful fallback if `DATABASE_URL` is pending.

3. **Staff Authentication & Sessions**:
   - `src/lib/server/auth.js` implementing PBKDF2 salted password hashing (native `crypto`), timing-safe verification, and 256-bit SHA-256 session token generation.
   - Secure HTTP-only cookies (`nishkea_staff_session`) with `SameSite=Lax`, `Path=/`, and `Secure` flags.
   - API routes: `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`.
   - Staff Login UI: `src/app/dashboard/login/page.js` with testing role-switcher.

4. **RBAC & Authorization Guardrails**:
   - `src/lib/server/permissions.js` implementing strict Deny-by-Default RBAC:
     - **Owner**: Full administrative and financial grants (`role:manage`, `cost:view`, `report:export`).
     - **Manager**: Operational grants (`review:decision`, `order:dispatch`, `inventory:adjust`, `cost:view`).
     - **Inventory Staff**: Receipts, counts, dispatches; **DENIED** `cost:view` and `order:refund`.
     - **Sales & Support**: Leads and orders; **DENIED** `cost:view`, `inventory:adjust`, and `product:publish`.
     - **Accounts**: Reconciliation, dues, and refunds; **DENIED** `inventory:adjust`.
   - Supplier cost isolation gate: `/api/dashboard/cost-check` verifies that non-authorized roles are rejected with HTTP 403 Forbidden and logged to `audit_logs`.

5. **Automated Verification Suite**:
   - `tests/permissions.test.mjs` (`npm test`) executing 16 acceptance checks:
     - Unauthenticated denial test (PASS).
     - Inventory staff supplier cost denial test (PASS).
     - Sales staff supplier cost denial test (PASS).
     - Sales staff inventory adjustment denial test (PASS).
     - Manager/Owner supplier cost allowance test (PASS).
     - Manager role management denial test (PASS).
     - Password hashing & PBKDF2 verification test (PASS).
     - Session token uniqueness and entropy test (PASS).

## Acceptance Gate
- Build: PASS (`next build` compiled 15 routes cleanly in 4.7s).
- Lint: PASS (`✔ No ESLint warnings or errors`).
- Permissions & Security Tests: PASS (16/16 tests passing).
- Next Dependency-Ready Node: **Node 4 — Catalogue, Variants, Approved Media & Imports**.
