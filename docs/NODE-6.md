# Node 6 — 30-Day Collection Reviews, Sell-Through Tracking & Lifecycle Automation Summary

## Objective
Implement the 30-day collection review engine, sell-through rate calculations, automated review reminders, and audited lifecycle state transitions per `docs/PRODUCT.md` and `docs/INVENTORY.md`:
1. Default review interval is 30 calendar days from launch.
2. Idempotent evaluation: Due reviews transition status to `under_review` and generate open team review tasks without duplicate entries or unintended price/stock alterations.
3. Period Sell-Through Rate formula: `Net Units Sold / (Opening Sellable Stock + Eligible Receipts in Period)`.
4. Permitted lifecycle review decisions (`CONTINUE`, `PROMOTE_TO_PERMANENT`, `STOP_REORDER`, `CLEARANCE`, `DISCONTINUE`, `SUPPLIER_RETURN`).
5. Strict RBAC authorization: Only permitted roles (`manager`, `owner`) can record review decisions. Sales/Support staff are denied access.
6. Immutable audit logging of all lifecycle decisions and resolution of linked operational tasks.

## Delivered in Node 6

1. **Collection Review & Lifecycle Engine (`src/lib/server/reviews.js`)**:
   - `calculateReviewDueDate(launchDate, intervalDays = 30)`: Precise calendar date projection in company timezone.
   - `isReviewDue(reviewDueDate, asOfDate)`: Real-time due check comparing as-of date to review deadline.
   - `calculateSellThroughRate(netUnitsSold, openingSellableStock, eligibleReceipts)`: Safe period sell-through rate formula with zero-denominator (`N/A`) protection.
   - `evaluateReviewQueue(asOfDate)`: Idempotent automated evaluator that transitions overdue active designs to `under_review` and creates actionable operational tasks.
   - `recordReviewDecision({ designCode, decision, reason, nextReviewDate, actor })`:
     - Applies state transitions:
       - `CONTINUE` -> `active`, next review due +30 days, reorder policy `standard`.
       - `PROMOTE_TO_PERMANENT` -> `permanent` collection, reorder policy `reorder_suggested`.
       - `STOP_REORDER` -> `active`, reorder policy `blocked_end_of_line`.
       - `CLEARANCE` -> `clearance`, reorder policy `blocked_clearance`.
       - `DISCONTINUE` -> `discontinued`, reorder policy `blocked_clearance`.
       - `SUPPLIER_RETURN` -> `clearance`, reorder policy `blocked_clearance`.
     - Automatically resolves linked open review tasks (`status: 'RESOLVED'`).
     - Emits `COLLECTION_REVIEW_DECISION` audit events.

2. **Server-Side API Endpoints**:
   - `GET /api/reviews/queue`: Evaluates and returns the active review queue with calculated sell-through metrics and linked operational tasks.
   - `POST /api/reviews/decision`: Authenticated mutation enforcing `review:decision` permission (Manager/Owner only), rejects unauthorized actors with HTTP 403 Forbidden.

3. **Dashboard Backoffice Integration (`src/app/dashboard/page.js`)**:
   - **TAB 3 (30-Day Collection Decision Queue)**:
     - Live data table showing Design Code, Launch Date, Review Due Date, Days Active, Opening/Receipts, Units Sold, Calculated Sell-Through (color-coded), Status badge, and Reorder Policy.
     - Live `Record Decision` button opening the decision modal dialog.
   - **Interactive Review Decision Modal**:
     - Modal dialog enabling managers to choose one of the 6 valid decisions, provide justification (minimum 5 characters), and apply the decision.
     - Dismissible success/error notification banners.
   - **TAB 1 (Overview Tasks)**:
     - Priority team tasks dynamically linked to review tasks; resolved decisions immediately show `RESOLVED` status badges.

4. **Automated Verification Suites (`tests/reviews.test.mjs`, `tests/inventory.test.mjs`, `tests/permissions.test.mjs`)**:
   - 23 automated review acceptance tests:
     - Review due date +30 days calculation (PASS).
     - Due date comparison logic (past, equal, future) (PASS).
     - Sell-through rate formula precision (PASS).
     - Zero denominator protection formatting as `N/A` (PASS).
     - Idempotent queue evaluation preventing duplicate tasks (PASS).
     - RBAC permission gate rejecting sales staff (PASS).
     - `CONTINUE` decision transition (PASS).
     - `CLEARANCE` decision transition & reorder blocking (PASS).
     - `PROMOTE_TO_PERMANENT` collection type graduation (PASS).
     - Linked operational task automatic resolution (PASS).
     - Actor ID and timestamp tracking in audit logs (PASS).
   - **Combined Test Run**: 49/49 tests passing via `npm test` (16 permissions + 10 inventory + 23 reviews).

## Acceptance Gate Results
- **Automated Tests**: PASS (49/49 tests passing across all suites).
- **Linter**: PASS (`✔ No ESLint warnings or errors`).
- **Live Browser Verification**: PASS (Recorded `CONTINUE` decision for `NSK-EAR-001`, verified status transition to `active`, extended review date +30 days, verified linked task resolution, full screenshot captured: `reviews_decision_success_1792489974935.png`).
- **Next Dependency-Ready Node**: Node 7 — Complete Luxury Storefront, Dynamic Category Filters & Product Detail Experience.
