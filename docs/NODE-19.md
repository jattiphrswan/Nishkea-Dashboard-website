# Node 19 — Real-time Multi-Courier Shipping Automation & Reverse Logistics

## Context & Objectives
NISHKÈA pieces are high-value, fragile, and handcrafted jewellery. Deliveries require specialized insured transit partners (BlueDart Apex/Surface, Delhivery Express, Shiprocket High-Value, Sequel Logistics for high-value hallmarked gold). 

Node 19 establishes the complete carrier-agnostic logistics pipeline:
1. **Real-time Pincode Serviceability & SLA Estimation**:
   - Check domestic Indian 6-digit PIN codes against carrier matrices.
   - Return estimated transit time (e.g. Metro 24-48 hrs, Rest of India 3-5 days), COD eligibility, and insured limits.
2. **Automated Consignment Creation & AWB Generation**:
   - Create outbound shipments with deadweight + volumetric weight calculations.
   - Issue authentic Air Waybill (AWB) numbers across carriers (`BLUEDART-NSK-xxxx`, `DELHIVERY-NSK-xxxx`, etc.).
   - Generate printable printable shipping labels / manifests (PDF/HTML standard) containing QR barcodes and tamper-evident packaging guidance.
3. **Live Milestone Courier Tracking**:
   - Webhook & polling tracking aggregator normalizing carrier status into unified atelier states:
     - `BOOKED` -> `PICKUP_SCHEDULED` -> `IN_TRANSIT` -> `OUT_FOR_DELIVERY` -> `DELIVERED` / `EXCEPTION` / `RTO`
   - Automatically update internal order status and trigger customer notification events (`notifyOrderDispatched`).
4. **Armoured Reverse Logistics (Returns & Exchanges)**:
   - Schedule tamper-sealed reverse pickups for approved customer returns.
   - Return AWB creation with proof-of-pickup verification.
   - Security seal inspection verification gate before refund release.
5. **Strict Security & RBAC Scoping**:
   - Staff roles (`inventory_staff`, `manager`, `owner`) can manifest shipments and book pickups.
   - `sales_support` can view tracking statuses and serviceability without manifesting dispatches.
   - Carrier API secrets and internal shipping contract rates are strictly protected and never exposed to public bundles or client responses.

## Technical Interfaces
- **Domain Service**: `src/lib/server/shipping.js`
- **REST Endpoints**:
  - `POST /api/shipping/serviceability` (Public/Checkout PIN code check)
  - `POST /api/shipping/manifest` (Staff order dispatch & label generation)
  - `GET /api/shipping/track/[awb]` (Live tracking milestone lookup)
  - `POST /api/shipping/reverse-pickup` (Approved return reverse logistics)
- **Storefront Integration**:
  - Checkout & Product pages: Interactive Pincode Serviceability Checker with live delivery date estimates.
  - Account order tracker: Real-time milestone stepper connecting to courier events.
- **Test Suite**: `tests/shipping.test.mjs`

