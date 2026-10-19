# Logical data model
All mutable records carry IDs and created/updated timestamps. Financial and stock history uses immutable events, with actor/source metadata. Foreign keys and unique constraints are required.

| Entity | Core fields / relationships |
|---|---|
| Company, Location | timezone, currency; warehouse/shop/storage |
| User, Role, Permission | staff identity, status, scoped grants |
| Customer, Address | customer identity separate from staff; contact/consent |
| Category, Collection | names/slugs; merchandising grouping |
| ProductDesign | category, copy/media, collection type, lifecycle, dates |
| ProductVariant | design FK, unique SKU, normalized options, sales unit, price |
| Media | storage key, alt, position, approval |
| Supplier, SupplierProduct | contact; variant mapping, minimum quantity, lead time |
| PurchaseOrder, PurchaseLine | supplier, ordered quantity, price/currency snapshot |
| GoodsReceipt, ReceiptLine | purchase line, received quantity, batch, inspection |
| StockBatch | variant, receipt date, cost; optional physical expiry |
| StockMovement | batch, location, condition, signed quantity, reason/source |
| Reservation, ReservationLine | order, expiry, allocated batch/variant quantities, state |
| Order, OrderLine | customer/channel; quantity and commercial snapshots |
| Shipment, ShipmentLine | order lines, dispatched quantities, tracking |
| Payment, Refund, PaymentEvent | provider IDs, amount, state; unique event key |
| Return, ReturnLine, Inspection | shipped item, quantity, resolution and condition |
| ReviewDecision | design, due date, decision, reason, actor, next date |
| Offer, Bundle, BundleComponent | eligibility/dates; component variant quantities |
| Lead, CRMActivity | source, owner, stage, contact notes/follow-up |
| Task, TaskComment | assignee, due date, priority, linked business record |
| Expense, SupplierPayment | approval, amount/currency, source reference |
| ContentPage, KnowledgeDocument | approved content, version and visibility |
| ChatSession, ChatMessage | identity/scope, retention, references, escalation |
| AuditEvent, Job, OutboxEvent | trace ID, actor, action, retry/idempotency state |

## Constraints
Money: integer minor units + currency, no floating-point arithmetic. Stock counts: nonnegative integer sales units unless a future unit policy explicitly permits fractions. Option keys canonicalized. Payment provider event IDs unique per provider. Return quantity bounded by shipped minus previous returns. Batch allocations sum to reserved quantities; dispatch cannot exceed allocation. Index SKU, slug, order number, movement variant/location/time, pending review date and task due/assignee.

Balances may be materialized for performance but must reconcile to the ledger. Customer deletion/privacy handling preserves necessary transaction records under a defined retention policy; legal retention is an open business decision.
