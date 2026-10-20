# Node 5 — Operational Inventory Transactions, Reservation Ledger & Goods Receipt Summary

## Objective
Implement the transactional inventory management engine enforcing fundamental jewellery business rules:
1. Available = Sellable On-Hand − Active Reservations.
2. Hard Gate: Zero overselling (never allow negative available stock).
3. Immutable append-only ledger movements with signed quantities.
4. Strict FIFO batch allocation for stock ageing (0–30, 31–60, 61–90, 91+ days) and supplier cost isolation.
5. Idempotent reservation TTL expiry and dispatch consumption.

## Delivered in Node 5

1. **Transactional Inventory Engine (`src/lib/server/inventory.js`)**:
   - `computeAvailableStock(sellableOnHand, activeReserved)`: Strict formula enforcing non-negative available units.
   - `getVariantStockSummary(variantId)`: Real-time queries with live DB pooling and fallback to in-memory ledger.
   - `createGoodsReceipt({ variantId, batchReference, quantity, unitCostMinor, ... })`: Creates new batch records, logs signed `+` receipt movements, writes audit entries.
   - `createReservation({ variantId, quantity, orderRef, ttlMinutes, ... })`: Guarantees zero overselling; locks units across FIFO batches with TTL.
   - `releaseReservation(reservationId)`: Restores reserved units back to available pool idempotently.
   - `consumeReservation({ reservationId, dispatchRef, ... })`: Permanently decrements physical on-hand stock upon dispatch with signed `-` movement.
   - `recordStockAdjustment({ batchId, nextQuantity, reason, ... })`: Audited quantity adjustments preventing negative inventory.
   - `calculateStockAgeing(reportDate)`: Categorizes active batches into 0–30, 31–60, 61–90, and 91+ day buckets with unit and cost percentages.
   - `getAllBatches(user)`: Enforces RBAC supplier cost isolation (`cost:view`).

2. **Server-Side API Endpoints**:
   - `GET /api/inventory/summary`: Returns live ageing breakdown, tracked batches, and recent movements (with RBAC cost redaction).
   - `POST /api/inventory/receipt`: Authenticated goods receipt creation requiring `inventory:receive` permission.
   - `POST /api/inventory/reserve`: Atomic reservation hold creation with zero-overselling gate.
   - `POST /api/inventory/adjust`: Manual inventory adjustments requiring `inventory:adjust` permission.

3. **Dashboard Inventory Management UI (`src/app/dashboard/page.js`)**:
   - **Interactive Goods Receipt Modal**: Modal dialog allowing warehouse staff to select variant SKU, enter batch reference code, quantity, and unit cost in paise.
   - **Live Batch Ledger**: Displays active FIFO batches, initial units, remaining units, received date, and RBAC-controlled unit costs.
   - **Recent Signed Movements Table**: Real-time append-only movement log displaying signed quantities (`+35`, `-2`), movement type (`RECEIPT`, `RESERVATION_ALLOCATION`, `DISPATCH_CONSUME`, `STOCK_ADJUSTMENT`), and actor IDs.
   - **SKU Availability Gate**: Displays live `Available for Sale = Sellable − Reserved`.
   - **Disclaimers & Badges**: Transparently differentiates active transactional ledger features from mock payment rails per `AGENTS.md`.

4. **Automated Verification Suites (`tests/inventory.test.mjs` & `tests/permissions.test.mjs`)**:
   - 10 automated inventory test gates:
     - Available stock formula verification (PASS).
     - Real-time stock summary calculation (PASS).
     - Goods receipt creation & signed positive movement (PASS).
     - Atomic checkout reservation hold (PASS).
     - Zero overselling rejection when requested > available (PASS).
     - Reservation release idempotency (PASS).
     - Dispatch consumption & permanent physical deduction (PASS).
     - Audited stock adjustments preventing negative stock (PASS).
     - FIFO stock ageing classification into 4 brackets (PASS).
     - Supplier cost isolation redaction for non-permitted roles (PASS).
   - 16 automated RBAC & security test gates (PASS).
   - **Combined Test Run**: 26/26 tests passing via `npm test`.

## Acceptance Gate Results
- **Automated Tests**: PASS (26/26 tests passing).
- **Browser Live Verification**: PASS (Goods receipt modal posted `BATCH-202610-AUTUMN-RECEIPT` for 35 units, verified signed `+35` movement `MOV-#1`, updated sellable units on-hand to 152, screenshot captured: `inventory_goods_receipt_success_1792489532081.png`).
- **Next Dependency-Ready Node**: Node 6 — 30-Day Collection Reviews, Sell-Through Tracking & Lifecycle Automation.
