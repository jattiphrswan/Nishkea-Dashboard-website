# Node 8 — Checkout, Client-to-Server Order Confirmation, Transactional Reservations & Shipping

## Objective
Deliver a production-ready, transactional checkout and fulfillment loop satisfying `docs/ROADMAP.md`, `docs/INVENTORY.md`, and `docs/API-CONTRACTS.md`:
1. Server-side totals validation in integer minor currency units (`paise`, currency `INR`), rejecting client price tampering.
2. Zero-overselling gate: Atomic stock reservations via the transactional inventory engine (`createReservation`), returning HTTP 409 Conflict upon insufficient stock.
3. Idempotent checkout submission with idempotency key deduplication.
4. Payment gateway webhook endpoint (`POST /api/payments/webhook`) with raw-body HMAC SHA-256 signature verification and event deduplication.
5. State transitions:
   - On payment success: `PENDING` -> `PAID`, fulfillment state -> `PENDING_PICKING`.
   - On payment failure: `FAILED`, releasing atomic reservations back to the available inventory pool.
6. Order fulfillment & courier dispatch (`POST /api/orders/[id]/dispatch`): consumes reservations, deducts physical batch quantities, records signed `DISPATCH` movements, and sets carrier tracking.
7. Return & inspection workflow (`POST /api/orders/[id]/return` and `inspect-return`): enforces `total returned <= shipped`, physical quarantine, and executes disposition (`SELLABLE_RESTOCK` with restock movements or `DAMAGED_SCRAP`) with refund authorization.
8. Storefront checkout experience at `/checkout` with order confirmation view.
9. Backoffice operational orders management in `/dashboard` (Tab 5).

---

## Delivered in Node 8

1. **Order & Checkout Service (`src/lib/server/orders.js`)**:
   - `createOrder`: Validates customer details, delivery address, server prices, complimentary shipping threshold (>= ₹3,000 / 300,000 paise free, else ₹250 flat), and creates atomic stock reservations with rollback protection.
   - `verifyWebhookSignature`: Constant-time HMAC SHA-256 verification against webhook secret.
   - `handlePaymentWebhook`: Idempotent processing of `payment.succeeded` and `payment.failed`.
   - `dispatchOrder`: Consumes reservations, updates warehouse batches, records signed `DISPATCH` movements, and assigns tracking numbers.
   - `requestOrderReturn`: Strictly enforces `return quantity <= shipped quantity - prior returns`.
   - `inspectAndResolveReturn`: Processes return disposition, executes restock movement if sellable, updates payment to `REFUNDED_RETURN` and fulfillment to `RETURNED_INSPECTED`.

2. **Server API Routes**:
   - `POST /api/checkout` — Public checkout endpoint.
   - `POST /api/payments/webhook` — HMAC-verified gateway webhook.
   - `GET /api/orders` — Orders list for customer / staff.
   - `GET /api/orders/[id]` — Order details and tracking lookup.
   - `POST /api/orders/[id]/dispatch` — Warehouse order dispatch mutation.
   - `POST /api/orders/[id]/return` — Customer/staff return request with bounded validation.
   - `POST /api/orders/[id]/inspect-return` — Return inspection and inventory disposition.

3. **Storefront Checkout Experience (`src/app/(storefront)/checkout/page.js`)**:
   - 2-Column luxury checkout layout with contact information, delivery destination, and payment method selection.
   - Live order summary with line items, subtotal, insured shipping fee, and grand total.
   - Order confirmation screen displaying human-readable order number (`NSK-2026-XXXX`), `PAID (Verified)` badge, `PENDING_PICKING` fulfillment status, allocated items, and courier address.
   - Cart Proceed to Checkout button updated from Node 2 offline placeholder to live `/checkout` route.

4. **Backoffice Dashboard Queue (`src/app/dashboard/page.js` Tab 5)**:
   - Live Orders & Dispatch Queue connected to `GET /api/orders`.
   - Interactive Dispatch Order modal dialog with carrier selection and tracking generation.
   - Interactive Return Inspection modal dialog with disposition selection (`SELLABLE_RESTOCK` / `DAMAGED_SCRAP`).

5. **Automated Acceptance Test Suite (`tests/checkout.test.mjs`)**:
   - Minor integer currency arithmetic (paise standard) (PASS).
   - Complimentary shipping threshold calculation (PASS).
   - Idempotency key deduplication (PASS).
   - Zero-overselling gate: HTTP 409 Conflict when quantity > available (PASS).
   - HMAC SHA-256 webhook signature verification and forgery rejection (PASS).
   - Webhook event deduplication (PASS).
   - Payment success state transition to `PAID` / `PENDING_PICKING` (PASS).
   - Payment failure release of stock reservations (PASS).
   - Order dispatch reservation consumption and tracking assignment (PASS).
   - Return bounded validation (`return <= shipped`) (PASS).
   - Return inspection and `SELLABLE_RESTOCK` ledger movement (PASS).
   - **Combined Test Run**: 227/227 tests passing across all 5 suites (`npm test`).

---

## Acceptance Gate Results
- **Automated Tests**: PASS (227/227 tests passing across RBAC, inventory, reviews, storefront, and checkout suites).
- **Linter**: PASS (`✔ No ESLint warnings or errors`).
- **Live Browser Verification**:
  - Storefront Checkout: Placed order via `/checkout`, confirmed order number generated, verified `PAID (Verified)` status, allocated pieces list, and courier destination.
  - Backoffice Dispatch: Opened `/dashboard?tab=orders`, selected order `NSK-2026-1081`, opened Dispatch Order modal, confirmed courier pickup via BlueDart Express, verified fulfillment state updated to `DISPATCHED` with tracking `BLUEDART-NSK-3288587`.
- **Next Dependency-Ready Node**: Node 9 — Suppliers, Purchase Approvals & Partial Receipts.
