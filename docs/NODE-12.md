# Node 12 — Payment/Expense Records, Balances & Business Financial Reports

**Status:** COMPLETE / PASS  
**Date:** 2026-10-21  
**Lead:** Senior Full-Stack Architecture Specialist  
**Relevant Rules:** `AGENTS.md`, `docs/CRM-TEAM-FINANCE.md`, `docs/DECISIONS.md` (D12, D18)

---

## 1. Executive Summary

Node 12 delivers the comprehensive financial accounting, commercial reconciliation, and business performance reporting engine for the NISHKÈA Maison. In strict compliance with `AGENTS.md` and `docs/CRM-TEAM-FINANCE.md`:

1. **Integer Minor Currency Units (`price_minor`):** All ledgers (customer payments, supplier disbursements, overhead expenses, and customer refunds) operate in integer paise (INR).
2. **Explicit Single Currency:** Strict single-currency (`INR`, ₹) enforcement across all transactions and summaries.
3. **Non-Inferred Transactions:** Customer payments and supplier disbursements are never inferred merely from order or PO status; they require explicit gateway or bank transaction records with unique reference IDs.
4. **Commercial Reconciliation Standard:**
   - $\text{Net Merchandise Revenue} = \text{Gross Receipts} - \text{Collected GST (3\%)} - \text{Disbursed Customer Refunds}$
   - $\text{Gross Merchandise Profit} = \text{Net Merchandise Revenue} - \text{Allocated COGS (FIFO)}$
   - $\text{Gross Margin \%} = (\text{Gross Merchandise Profit} / \text{Net Merchandise Revenue}) \times 100$
   - $\text{Net Operational Trading Surplus} = \text{Gross Merchandise Profit} - \text{Approved Operating Overheads}$
   - Explicit statutory disclosure: Corporate tax, depreciation, and legal write-offs are deferred to formal corporate tax filings.
5. **Full Ledger Interactivity & Export:** Complete sub-ledgers for Customer Receipts, Supplier Disbursements, Operating Expenses, and Refunds, plus 1-click accounting CSV reconciliation export.
6. **Operational Performance Reports:** Inventory velocity (Sell-Through Rate: $\frac{\text{Net Units Sold}}{\text{Opening Stock} + \text{Eligible Receipts}}$), category profit contribution breakdown, and stock ageing valuation buckets.

---

## 2. Deliverables & Implementation Details

### A. Database Migration 005 (`database/migrations/005_finance_and_reports.sql`)
- `customer_payments`: Tracks receipt transactions against orders, partial amounts, payment types (`ADVANCE_DEPOSIT`, `PROGRESS_PAYMENT`, `FULL_PAYMENT`), and gateway transaction IDs.
- `supplier_disbursements`: Tracks payouts against purchase orders, disbursement types (`ADVANCE_DEPOSIT`, `PROGRESS_PAYMENT`, `FINAL_SETTLEMENT`), and bank transaction references (`NEFT_RTGS`, etc.).
- `operating_expenses`: Tracks categorized overhead expenses (`SHOWROOM_RENT`, `LOGISTICS_PACKAGING`, `MARKETING_MEDIA`, `UTILITIES_SECURITY`, `STUDIO_EQUIPMENT`, `INSURANCE_VAULT`, `LEGAL_PROFESSIONAL`, `OFFICE_ADMIN`) with isolated GST tax amounts and approval status.
- `refund_records`: Tracks return refunds with gateway reversal identifiers bounded by paid order balances.

### B. Core Finance Domain Service (`src/lib/server/finance.js`)
- `recordCustomerPayment()`: Validates positive amount, prevents duplicate gateway IDs, updates order accumulated paid balance and payment status (`PAID` or `PARTIALLY_PAID`).
- `recordSupplierDisbursement()`: Validates positive amount, prevents duplicate bank references, updates PO accumulated disbursement and balance due.
- `recordOperatingExpense()`: Enforces permitted category enum, validates non-zero amount, isolates tax component, and logs audit events.
- `processCustomerRefund()`: Bounded refund verification (cannot refund more than customer paid), records gateway reversal ID, and adjusts net receipts.
- `getFinancialSummary()`: Calculates commercial reconciliations, gross margin %, operating overheads total, net operational surplus, accounts receivable (unpaid order balances), and accounts payable (unpaid PO dues).
- `getFinancialTransactionsList()`: Returns unified sub-ledgers for receipts, disbursements, expenses, and refunds.
- `generateReconciliationCSV()`: Generates standard audit-ready CSV with formatted headers and signed ledger rows for accountants.
- `getBusinessPerformanceReports()`: Calculates real-time Sell-Through Rate from batch movements, category revenue contributions, and stock ageing risk buckets.

### C. Server-Side RBAC Guardrails (`src/lib/server/permissions.js`)
- Added permissions:
  - `finance:view`: Authorized for `owner`, `manager`, `accounts_staff`.
  - `finance:transact`: Authorized for `owner`, `manager`, `accounts_staff`.
  - `finance:export`: Authorized for `owner`, `manager`, `accounts_staff`.
  - `report:view`: Authorized for `owner`, `manager`, `accounts_staff`.
- Strictly denied for `inventory_staff` and `sales_support` to prevent leaking margins, supplier costs, and executive finances.

### D. REST API Endpoints
- `GET /api/finance/summary`: Aggregated commercial KPIs, margin reconciliations, and receivables/payables.
- `GET /api/finance/transactions`: Filterable sub-ledgers.
- `POST /api/finance/payments/customer`: Record incoming receipt against order.
- `POST /api/finance/payments/supplier`: Record outgoing disbursement against PO.
- `POST /api/finance/expenses`: Record operating overhead expense.
- `POST /api/finance/refunds`: Process customer return refund.
- `GET /api/finance/export`: Download audit-ready reconciliation CSV.
- `GET /api/finance/reports`: Velocity and performance reports.

### E. Dashboard UI Components (`src/app/dashboard/page.js`)
- **Tab 9 (Finance):** Connected `FinanceTab` ([`src/components/dashboard/FinanceTab.js`](file:///c:/Users/SkyFish/OneDrive/project/nishkea/src/components/dashboard/FinanceTab.js)):
  - 6 KPI stat cards: Net Merchandise Revenue, Allocated COGS, Gross Merchandise Margin %, Approved Overhead Expenses, Operational Trading Surplus, and Receivables / Payables.
  - Audit reconciliation formula standard notice box.
  - Sub-ledger navigation tabs: Customer Receipts, Supplier Disbursements, Operating Expenses, Refunds, and Overhead Category Breakdown.
  - Modals: *Record Customer Receipt*, *Disburse Supplier Dues*, *Record Overhead Expense*.
  - 1-click CSV download action.
- **Tab 10 (Reports):** Connected `ReportsTab` ([`src/components/dashboard/ReportsTab.js`](file:///c:/Users/SkyFish/OneDrive/project/nishkea/src/components/dashboard/ReportsTab.js)):
  - Period Sell-Through Rate KPI (55.8%, 148 units sold of 265 received units).
  - Explicit Sell-Through formula card: $\frac{\text{Net Units Sold}}{\text{Opening Stock} + \text{Eligible Receipts}}$.
  - Category Sales & Revenue Contribution table with visual progress share bars.
  - Stock Ageing Valuation & Risk table (`0–30 Days`, `31–60 Days`, `61–90 Days`, `91+ Days`) with risk badges (`OPTIMAL`, `HEALTHY`, `WATCHLIST`, `CLEARANCE_CANDIDATE`).

---

## 3. Verification & Acceptance Testing

### Test Suite Summary (`npm test`)
All 416 assertions pass across 9 test suites:
- `tests/permissions.test.mjs`: 16 assertions (RBAC guardrails).
- `tests/inventory.test.mjs`: 38 assertions (FIFO movements, reservations, zero-oversell).
- `tests/reviews.test.mjs`: 35 assertions (30-day review queue).
- `tests/orders.test.mjs`: 44 assertions (dispatch, tracking, returns).
- `tests/suppliers.test.mjs`: 54 assertions (suppliers, PO approvals, goods receipt).
- `tests/crm.test.mjs`: 52 assertions (CRM directory, leads, recurrence engine).
- `tests/customer-account.test.mjs`: 42 assertions (client portal, address, password rotation, contact inquiry).
- `tests/finance.test.mjs`: 46 assertions:
  - Suite 1: Customer Receipts & Partial Allocation (4/4 PASS)
  - Suite 2: Supplier Disbursements & PO Dues (4/4 PASS)
  - Suite 3: Operating Overhead Expenses (5/5 PASS)
  - Suite 4: Customer Return Refunds (4/4 PASS)
  - Suite 5: Financial Summary & Commercial Reconciliations (12/12 PASS)
  - Suite 6: Server-Side RBAC Guardrails (4/4 PASS)
  - Suite 7: CSV Audit Reconciliation Export (5/5 PASS)
  - Suite 8: Business Performance Reports (4/4 PASS)

### ESLint & Production Build
- `npm run lint`: `✔ No ESLint warnings or errors`
- `npm run build`: `✔ Generating static pages (53/53) — Compiled successfully with zero errors.`

### Browser Visual Inspection
- Chromium live inspection confirmed loaded KPI metrics, reactive sub-ledger tabs, modals, and report tables:
  - Finance Tab: `live_finance_tab_1792583661615.png`
  - Reports Tab: `live_reports_tab_1792583693038.png`
  - Full browser verification video saved to artifacts.

---

## 4. Handoff to Node 13

- **Next Dependency-Ready Node:** Node 13 — Polish, Production Readiness, Security Hardening & Pre-Launch Verification.
- **Node 15 (Future Node):** WooCommerce-Style Advanced Product Editor, Media Studio & Variant Matrix (documented in `docs/NODE-15.md`). Foundational product catalog API and modal editing are already active and functional.
