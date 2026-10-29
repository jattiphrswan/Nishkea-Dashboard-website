# Node 18: Automated Omnichannel Notifications Engine (WhatsApp & Luxury Transactional Emails)

## 1. Executive Summary & Objective
Per roadmap and communication standards, **Node 18** establishes an automated omnichannel customer notification engine for NISHKÈA. Jewellery acquisitions require high-trust, real-time client communication from order confirmation to insured courier delivery.

The engine provides multi-channel failover:
1. **WhatsApp Business Cloud API** (Primary channel for Indian clients: instant confirmation, BlueDart tracking, digital hallmark cards).
2. **Luxury Transactional Email** (HTML emails formatted in Cormorant Garamond, Royal Burgundy, and 18K Champagne Gold).
3. **SMS Alerts** (Fallback for transit delivery updates).
4. **Deterministic Sandbox Simulator** (Full offline testability with cryptographically verifiable delivery ledgers).

---

## 2. Notification Triggers & Templates

| Trigger Event | Target Audience | Channels | Content / Dynamic Fields |
|---|---|---|---|
| `ORDER_CONFIRMED` | Jewellery Buyer | WhatsApp + Email | Order Number, itemized designs, integer paise total, estimated delivery window, concierge support link. |
| `ORDER_DISPATCHED` | Jewellery Buyer | WhatsApp + SMS + Email | Carrier (BlueDart Express), AWB Tracking Number, live tracking URL, insured transit advisory. |
| `CONSULTATION_BOOKED` | Salon Client | WhatsApp + Email | Flagship Showroom (Jaipur / Mumbai), scheduled date/time, master artisan host. |
| `RETURN_INSPECTED` | Returning Client | Email | Inspection outcome (`SELLABLE_RESTOCK` / `REFUND`), gateway reversal reference. |

---

## 3. Privacy, Idempotency & Security Standards
1. **Idempotency Gate**: Every notification request specifies an `idempotencyKey` (e.g. `notif-order-confirm-${orderNumber}`). Duplicate webhook callbacks or repeated worker jobs never send duplicate WhatsApp messages or emails.
2. **Proprietary Cost Isolation**: Templates are strictly isolated from supplier acquisition costs, PO numbers, and wholesale margins.
3. **Integer Minor Currency Invariant**: All order sums and refunds displayed in notifications format exact paise values into rupees with zero float rounding.
4. **Audit Logging**: Every dispatched notification appends a signed audit event to `audit_logs`.

---

## 4. REST API Contracts

| Method | Endpoint | Description | Auth / Security |
|---|---|---|---|
| `POST` | `/api/notifications/send` | Dispatches notification event to client across active channels | Server / Authenticated |
| `GET` | `/api/notifications/log` | Retrieves dispatched notification history with delivery statuses | Manager / Owner RBAC |
| `POST` | `/api/notifications/test` | Test tool for staff to trigger sample WhatsApp or email previews | Manager / Owner RBAC |

---

## 5. Acceptance Criteria & Completion Gate
1. All templates render valid dynamic content with exact integer currency formatting and zero `NaN` or `undefined` tokens.
2. Duplicate notification requests with identical idempotency keys return `deduplicated: true` and zero repeated sends.
3. Supplier acquisition costs and internal margin ledgers are strictly absent from all rendered notification payloads.
4. Dispatched notifications log delivery timestamps, channel breakdowns, and message IDs.
5. All test suites (`npm test`) pass cleanly.
