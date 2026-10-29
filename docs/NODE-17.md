# Node 17: Live Payment Gateway Engine & Multi-Provider Payment Adapter

## 1. Executive Summary & Objective
Per roadmap and architecture decisions, **Node 17** implements a production-grade, multi-provider payment processing engine supporting **Razorpay** (primary Indian gateway for UPI, RuPay/Cards, NetBanking, and Jewellery EMI), **Stripe** (international credit/debit cards and digital wallets), and a **Deterministic Sandbox Simulator** for offline development and CI test verification.

This engine connects the Node 8 Order Engine (`src/lib/server/orders.js`), the Node 5 Transactional Inventory Ledger (`src/lib/server/inventory.js`), and the Node 12 Financial Ledgers (`src/lib/server/finance.js`), enforcing that no order is ever marked `PAID` without valid cryptographic signature verification, and zero overselling occurs.

---

## 2. Core Functional Requirements & Boundaries

### 1. Multi-Provider Gateway Abstraction (`src/lib/server/payments.js`)
- **Supported Providers**:
  - `razorpay`: Standard Indian payment gateway supporting UPI (Google Pay, PhonePe, Paytm), RuPay, Visa, MasterCard, NetBanking (50+ banks), and No-Cost EMI for jewellery $\ge \text{₹3,000}$.
  - `stripe`: Global credit/debit cards, Apple Pay, and Google Pay.
  - `sandbox`: Deterministic in-memory simulation with HMAC signature verification, enabling full test coverage without live bank connections or secret exposure.
- **Provider Auto-Negotiation**:
  - Automatically selects `razorpay` when `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are configured.
  - Selects `stripe` when `STRIPE_SECRET_KEY` is configured.
  - Gracefully falls back to `sandbox` with explicit visual notice in UI and health diagnostics.

### 2. Cryptographic Signature Verification & Webhook Deduplication
- **Razorpay Payment Verification**:
  $$\text{Generated Signature} = \text{HMAC-SHA256}(\text{order\_id} + "|" + \text{payment\_id}, \text{key\_secret})$$
  Payment is confirmed only when generated signature strictly matches `razorpay_signature`.
- **Webhook Signature Verification**:
  $$\text{HMAC-SHA256}(\text{raw\_body}, \text{webhook\_secret}) == \text{x-razorpay-signature}$$
- **Event Deduplication**:
  Tracks processed webhook event IDs in memory/database to prevent replay attacks and duplicate receipts.

### 3. Transactional Inventory & Financial Ledger Integration
- When payment is initiated: Stock reservation (`createReservation`) is confirmed.
- When payment succeeds (`payment.captured` / `PAYMENT_SUCCESS`):
  - Transitions order status: `PENDING_PAYMENT` $\to$ `PAID` / `PENDING_PICKING`.
  - Atomically consumes inventory reservation into a permanent physical dispatch deduction (`consumeReservation`).
  - Appends verified customer receipt into Node 12 commercial financial ledger (`recordCustomerPayment`).
- When payment fails or times out (`payment.failed`):
  - Transitions order status to `FAILED`.
  - Releases reserved units back to available sellable stock (`releaseReservation`).

### 4. Haute Joaillerie No-Cost & Low-Cost EMI Calculator
- Real-time monthly instalment calculation for pieces $\ge \text{₹3,000.00}$ (300,000 paise):
  - 3-Month Plan (0% interest No-Cost EMI)
  - 6-Month Plan (No-Cost EMI on select bank partners)
  - 9-Month & 12-Month Flexible Plans
- All calculations conducted in integer minor paise with exact rounding reconciliation.

---

## 3. REST API Contracts

| Method | Endpoint | Description | Auth / Security |
|---|---|---|---|
| `GET` | `/api/payments/config` | Returns active provider, currency, public key ID, and supported methods | Public |
| `POST` | `/api/payments/create-order` | Creates gateway payment order with server-side price validation | Public (Rate-limited) |
| `POST` | `/api/payments/verify` | Verifies client-submitted signature and confirms order | Public (HMAC Verified) |
| `POST` | `/api/payments/webhook` | Handles gateway webhook events (`payment.captured`, `payment.failed`, `refund.processed`) | Raw Body HMAC SHA-256 |
| `POST` | `/api/payments/refund` | Initiates gateway refund bounded by paid amount | Authenticated (Manager/Owner RBAC) |

---

## 4. Acceptance Criteria & Completion Gate
1. `createPaymentOrder` creates valid gateway order with minor currency integer paise and zero float drift.
2. Tampered or invalid HMAC signatures return HTTP 400 Bad Request with zero order status changes.
3. Successful payment verification transitions order to `PAID`, converts reservation to physical allocation, and logs financial payment receipt.
4. Payment failure releases stock reservations back to available inventory.
5. All 13 existing test suites plus the new Node 17 payment test suite pass cleanly (`npm test`).
6. Production build (`npm run build`) and ESLint (`npm run lint`) pass with zero errors.
