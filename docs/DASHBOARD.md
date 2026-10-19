# Private Company Dashboard — Implementation Status

## Implemented Workspace Structure
- Route: `/dashboard`
- Navigation: Desktop sidebar and accessible mobile collapsible drawer.
- Status Indicator: Prominent "Demo Dataset Active" and "Node 2 Foundation" badges.

## Operational Modules
1. **Overview**: Net sales, orders count, available physical units, FIFO unsold stock cost, low-stock designs, pending 30-day reviews, and daily priority tasks.
2. **Products & Variants**: Design vs variant table, unique SKUs, normalized options, sales units, price, and lifecycle states.
3. **30-Day Collection Reviews**: Review queue displaying days since launch, sell-through percentage, and decision actions (continue, permanent, clearance, discontinue).
4. **Inventory & Ageing**: Real-time stock calculation (`Available = Sellable On-Hand − Active Reservations`), batch ageing buckets (0–30, 31–60, 61–90, 91+ days), and restricted unit cost view.
5. **Orders & Dispatch**: Demo orders with line item snapshots, fulfillment status, and dispatch actions.
6. **Suppliers & Purchases**: Planned Node 9 banner and specifications.
7. **Customers & CRM**: Planned Node 10 banner and specifications.
8. **Team & Tasks**: Assignees, due dates, priority badges, and linked entity records.
9. **Finance**: Gross margin definition and commercial reconciliations.
10. **Reports**: Period sell-through rate formula and ageing summary.
11. **Settings**: Company parameters (Asia/Kolkata timezone, INR currency, 15-min reservation TTL).

## Inactive Mutation Disclosure
All mutation actions (e.g. "+ Receive Stock", "Record Decision", "+ Create Design") show an informative notice indicating which upcoming node will provide database persistence, rather than displaying false success alerts.
