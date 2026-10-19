# Inventory and collection rules
## Quantities
On-hand includes sellable, quarantine and damaged physical quantities. Available = sellable on-hand − active reservations. Expected incoming stock is shown separately and is not available for sale. Never allow negative available stock.

## Ledger and batches
Append-only movements identify variant, warehouse, batch, signed quantity, condition, reason, source document, actor and timestamp. Corrections use reversal entries. Receipt batches keep original received dates and unit costs. Transfers remove and add stock atomically with linked movements; in-transit stock has its own location/state.

Allocate oldest eligible receipts first for ageing and provisional FIFO cost reporting. New receipts never reset old batch ages. Opening balances create explicit receipt batches. Audit all adjustments.

## Monthly reviews
Review interval configurable per design; monthly-trend default is 30 calendar days from launch in company timezone. Reminder offsets configurable, initially 7 and 1 day before review. Scheduled jobs are idempotent. A due review creates one open review task and sets under-review; it never deletes stock, changes price, or unpublishes automatically.

Reviewer chooses continue, permanent, stop reorder, clearance, supplier return or discontinue. Record decision, actor, reason, next review and offer dates. Discontinue prevents new sales; archive hides normal catalogue listings while preserving history. Physical expiry, if relevant, is a separate batch field with its own blocking rule.

## Orders and reservations
Reserve atomically at checkout/order confirmation for a configured duration. Validate availability and price on the server. Expired/cancelled reservations release once. Dispatch consumes allocated stock and closes its reservation. Partial shipments consume only shipped quantities. Payment received after reservation expiry requires stock recheck or an exception queue; never silently oversell.

## Returns
Returned → quarantine → inspection → sellable/damaged/supplier return. Refund and physical restock are separate events. Record partial returns and enforce total returned <= shipped.

## Alerts/reorder
Permanent items may create reorder suggestions at threshold. Limited/clearance/discontinued items block routine reorder unless a permitted manager records an override. Suggestions never place supplier orders automatically.

## Metrics
Batch age = report date − received date. Show 0–30, 31–60, 61–90 and 91+ days; unsold cost uses remaining batch quantities. Design age uses launch date. Define period sell-through = net units sold / (opening sellable stock + eligible receipts in period), with transfers consistently consolidated and zero denominator shown as N/A. Show returns separately. Reports state date range, timezone and formula.
