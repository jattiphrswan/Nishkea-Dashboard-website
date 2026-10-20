# Node 9: Suppliers, Purchase Approvals & Partial Receipts

## 1. Overview
Node 9 implements the procurement foundation of NISHKÈA, bridging artisan guilds to physical vault inventory. It enforces multi-tier purchase order approvals, zero over-receipt gating, bounded vendor returns, integer minor currency mathematics (`paise`), and server-side RBAC supplier cost isolation per `AGENTS.md`.

---

## 2. Mathematical Invariants & Quantity Reconciliation
All procurement operations adhere to strict conservation and reconciliation invariants:

1. **Available Physical Stock Balance**:
   $$\text{Available Stock} = \text{Sellable On-Hand} - \text{Active Reservations}$$

2. **Zero Over-Receipt Invariant**:
   For any purchase order line $l$:
   $$\text{Received Quantity}_l \le \text{Ordered Quantity}_l$$
   $$\text{Remaining Pending Balance}_l = \text{Ordered Quantity}_l - \text{Received Quantity}_l \ge 0$$
   *Attempting to receive more units than remaining pending throws an immediate validation error.*

3. **Bounded Vendor Returns Invariant**:
   For any purchase order line $l$:
   $$\text{Returned Quantity}_l \le \text{Received Quantity}_l$$
   $$\text{Net Accepted On-Hand}_l = \text{Received Quantity}_l - \text{Returned Quantity}_l \ge 0$$
   *Attempting to return more units than currently accepted throws a validation error.*

4. **Integer Minor Currency Calculations**:
   All wholesale unit costs and total purchase commitments are represented as non-negative integer minor currency units (`paise`, where ₹1.00 = 100 paise) with explicit currency (`INR`):
   $$\text{Line Total Minor} = \text{Unit Cost Minor} \times \text{Quantity}$$
   $$\text{Total Cost Minor} = \sum_{l \in \text{lines}} \text{Line Total Minor}_l$$

---

## 3. Database Schema Migration
Defined in [`database/migrations/002_suppliers_and_po.sql`](file:///c:/Users/SkyFish/OneDrive/project/nishkea/database/migrations/002_suppliers_and_po.sql):
- **`suppliers`**: Master artisan partner directory (Jaipur, Surat, Bengaluru, Mumbai) with lead times, payment terms, and status.
- **`supplier_products`**: Contractual variant mappings with Minimum Order Quantities (MOQ), supplier SKUs, and wholesale integer costs.
- **`purchase_orders`**: Multi-tier procurement headers with high-value approval detection ($\ge \text{₹1,00,000.00}$), approval audit columns, and state machine (`DRAFT`, `PENDING_APPROVAL`, `APPROVED`, `PARTIALLY_RECEIVED`, `FULFILLED`, `CANCELLED`).
- **`purchase_order_lines`**: Itemized lines with ordered, received, and returned quantities, checked by constraints (`received_quantity <= ordered_quantity` and `returned_quantity <= received_quantity`).

---

## 4. Architectural Implementation & Deliverables

### A. Core Procurement Domain Service
**File**: [`src/lib/server/suppliers.js`](file:///c:/Users/SkyFish/OneDrive/project/nishkea/src/lib/server/suppliers.js)
- `getSuppliersList({ user })`: Returns active artisan guilds. If the user lacks the `cost:view` permission, all wholesale unit costs are redacted to `null`.
- `getSupplierById(id, { user })`: Returns single artisan guild details with RBAC cost redaction.
- `createPurchaseOrder({ supplierId, lines, expectedDeliveryDate, notes, user })`:
  - Enforces minimum order quantity (MOQ) per contracted supplier product.
  - Computes integer minor totals.
  - High-Value Gating: Orders $\ge \text{₹1,00,000.00}$ (10,000,000 paise) mandate `PENDING_APPROVAL` status even if created by managers. Smaller routine orders by managers auto-approve.
- `approvePurchaseOrder({ poId, user, approvalNotes })`:
  - RBAC Check: Only `manager` or `owner` roles can approve purchase orders (returns HTTP 403 Forbidden for unauthorized staff).
  - Transitions status to `APPROVED` and records `approvedBy`, `approvedAt`, and audit logs.
- `receivePurchaseOrderShipment({ poId, items, batchReference, receivedDate, user })`:
  - Hard Gate: Rejects receiving stock against an unapproved PO.
  - Zero Over-Receipt Protection: Rejects receipt quantities exceeding remaining ordered balance.
  - Transactional Inventory Ledger Integration: Calls `createGoodsReceipt`, creating a new FIFO `StockBatch` and appending a signed positive `RECEIPT` movement to the physical stock ledger.
  - Automatic Status Reconciliation: Updates line quantities; transitions PO to `FULFILLED` if completely received, or `PARTIALLY_RECEIVED` otherwise.
- `returnPurchaseOrderItems({ poId, items, reason, notes, user })`:
  - Bounded Return Validation: Cannot return more units than currently accepted received units.
  - Decrements target batch and appends signed negative `SUPPLIER_RETURN` movement.
- `getPurchaseOrdersList({ user, status, supplierId })` & `getPurchaseOrderById(id, { user })`:
  - Provides full reconciliation metrics (`totalOrdered`, `totalReceived`, `totalReturned`, `netAcceptedOnHand`, `remainingPending`, `percentReceived`).
  - Redacts wholesale unit costs and total commitment values for unauthorized roles.

### B. REST API Endpoints
1. `GET /api/suppliers` ([`src/app/api/suppliers/route.js`](file:///c:/Users/SkyFish/OneDrive/project/nishkea/src/app/api/suppliers/route.js))
2. `GET /api/purchase-orders` ([`src/app/api/purchase-orders/route.js`](file:///c:/Users/SkyFish/OneDrive/project/nishkea/src/app/api/purchase-orders/route.js))
3. `POST /api/purchase-orders` ([`src/app/api/purchase-orders/route.js`](file:///c:/Users/SkyFish/OneDrive/project/nishkea/src/app/api/purchase-orders/route.js))
4. `GET /api/purchase-orders/[id]` ([`src/app/api/purchase-orders/[id]/route.js`](file:///c:/Users/SkyFish/OneDrive/project/nishkea/src/app/api/purchase-orders/%5Bid%5D/route.js))
5. `POST /api/purchase-orders/[id]/approve` ([`src/app/api/purchase-orders/[id]/approve/route.js`](file:///c:/Users/SkyFish/OneDrive/project/nishkea/src/app/api/purchase-orders/%5Bid%5D/approve/route.js))
6. `POST /api/purchase-orders/[id]/receive` ([`src/app/api/purchase-orders/[id]/receive/route.js`](file:///c:/Users/SkyFish/OneDrive/project/nishkea/src/app/api/purchase-orders/%5Bid%5D/receive/route.js))
7. `POST /api/purchase-orders/[id]/return` ([`src/app/api/purchase-orders/[id]/return/route.js`](file:///c:/Users/SkyFish/OneDrive/project/nishkea/src/app/api/purchase-orders/%5Bid%5D/return/route.js))

### C. Backoffice Operations Dashboard (Tab 6)
**File**: [`src/app/dashboard/page.js`](file:///c:/Users/SkyFish/OneDrive/project/nishkea/src/app/dashboard/page.js)
- **KPI Metrics Bar**: Real-time counts of Contracted Artisan Guilds, Total Procurement Value Committed (or RBAC Cost Isolated badge), Pending Approvals, and Active Receiving / In-Transit POs.
- **Purchase Orders & Receipts Ledger Table**: Displays PO reference, artisan guild, ordered vs received vs returned breakdown, progress bar meter, delivery due date, approval status badge, and contextual action buttons.
- **Artisan Guilds Directory Cards**: Details on guild specialty, city, state, lead times, payment terms, contact info, and contracted catalogue variants with MOQs.
- **Interactive Modals**:
  1. *Draft Purchase Order Modal*: Select supplier, pick variant, input quantity with MOQ guidance, and submit.
  2. *Approve Purchase Order Modal*: Manager review with approval notes.
  3. *Receive Goods Shipment Modal*: Batch reference assignment, line-by-line receipt inputs capped at remaining pending units with zero over-receipt protection.
  4. *Return Defective Units Modal*: Bounded return input capped at net accepted on-hand units with defect reason and RMA notes.

---

## 5. Automated Verification & Acceptance Tests
**Test Suite**: [`tests/suppliers.test.mjs`](file:///c:/Users/SkyFish/OneDrive/project/nishkea/tests/suppliers.test.mjs)
- **Suite 1: Supplier Directory & RBAC Cost Redaction (5 tests)**
  - Public / unauthenticated callers receive `unitCostMinor: null`.
  - Roles without `cost:view` (`sales_support`) have wholesale costs redacted.
  - Managers and owners view exact wholesale integer costs (`85000` paise).
- **Suite 2: Purchase Order Creation & MOQ Enforcements (8 tests)**
  - Below-MOQ orders are rejected with descriptive MOQ messages.
  - Uncontracted variants are rejected.
  - High-value POs ($\ge \text{₹1,00,000.00}$) mandate `PENDING_APPROVAL`.
  - Low-value routine POs from managers auto-approve.
- **Suite 3: Multi-tier Approval Workflows (6 tests)**
  - Unauthorized staff (`warehouse_staff`) receive HTTP 403 Forbidden.
  - Manager/Owner approval transitions PO to `APPROVED` and records `approvedBy`.
  - Re-approval is idempotent.
- **Suite 4: Goods Receipt & Zero Over-Receipt Protection (14 tests)**
  - Goods receipt on unapproved POs is strictly blocked.
  - Partial goods receipt transitions PO to `PARTIALLY_RECEIVED`.
  - Creates new FIFO `StockBatch` in physical inventory ledger.
  - Appends signed positive `RECEIPT` movement to movements ledger.
  - Zero Over-Receipt Gate: Receipts exceeding remaining ordered balance are rejected.
  - Complete receipt transitions PO to `FULFILLED` with `remainingPending = 0`.
- **Suite 5: Bounded Vendor Returns (8 tests)**
  - Returns exceeding received quantities are rejected.
  - Valid vendor return satisfies reconciliation invariant:
    $$\text{Net Accepted On-Hand} = \text{Received} - \text{Returned}$$
  - Appends signed negative `SUPPLIER_RETURN` movement and decrements batch quantity.
  - Subsequent return correctly bounds to remaining net accepted balance.
- **Suite 6: Purchase Order Listing & RBAC Redaction (8 tests)**
  - List and single PO endpoints enforce cost isolation.
  - Status filters return accurate subsets.

### Overall Test Suite Results:
- `npm test`: **276 / 276 tests passing (100% across 6 test suites)**:
  - `permissions.test.mjs`: 16/16 PASS
  - `inventory.test.mjs`: 78/78 PASS
  - `reviews.test.mjs`: 47/47 PASS
  - `storefront.test.mjs`: 45/45 PASS
  - `checkout.test.mjs`: 41/41 PASS
  - `suppliers.test.mjs`: 49/49 PASS
- `npm run lint`: **PASS (`✔ No ESLint warnings or errors`)**

---

## 6. Visual Evidence
- **Screenshot Artifact**: `supplier_dashboard_final_1792494351725.png`
- **Subagent Video Recording**: `suppliers_verification_final_1792494250840.webp`
- Confirmed live:
  - Approved `PO-2026-0042` (Surat Precision Zirconia Atelier) -> status updated to `APPROVED`.
  - Received 20 units for `PO-2026-0041` (Jaipur Royal Filigree Guild) -> status updated to `FULFILLED` (50 / 50 rcvd, 100%).
