# Node 14 — Permission-Scoped Staff Assistant & Backoffice Operations Copilot

**Status:** COMPLETE / PASS  
**Date:** 2026-10-22  
**Lead:** Senior Full-Stack Architecture Specialist  
**Relevant Rules:** `AGENTS.md`, `docs/AI-CHATBOT.md`, `docs/DECISIONS.md` (D08, D19), `docs/PERMISSIONS.md`

---

## 1. Executive Summary

Node 14 implements the **Permission-Scoped Staff Assistant & Operations Copilot** for NISHKÈA. Operating directly within the Operations Centre dashboard, it provides intelligent backoffice retrieval tools strictly partitioned by Role-Based Access Controls (RBAC) per `docs/AI-CHATBOT.md`, `docs/PERMISSIONS.md`, and `AGENTS.md`:

1. **Role-Based Access Control (RBAC) & Server-Side Security Scoping:**
   - **Company Owner & Operations Manager:** Full retrieval access across inventory levels, 30-day collection review queues, team tasks, pipeline leads, orders, supplier acquisition costs, FIFO batch costs, and commercial profit margins.
   - **Financial Accounts:** Access to financial summaries, customer receipts, supplier disbursements, operating overheads, and FIFO unit batch costs; strictly denied collection review decisions.
   - **Inventory Specialist:** Access to physical warehouse batches, movements, and stock levels; **strictly denied** supplier acquisition costs, margins, and proprietary financials.
   - **Sales Support:** Access to customer leads, assigned tasks, and public catalogue; **strictly denied** supplier costs, margins, and 30-day review queues.
2. **Allowlisted Staff Retrieval Tools:**
   - `queryStaffReviews`: Evaluates 30-day collection review queue, period sell-through rates, and lifecycle policies.
   - `queryStaffInventory`: Live physical vault stock, reserved units, available units, and batch ageing (with automated unit cost redaction for non-cost roles).
   - `queryStaffFinance`: Commercial gross revenue, 3% jewellery GST, net merchandise revenue, FIFO COGS, gross margin %, and net operational trading surplus (strictly gated by `finance:view`).
   - `queryStaffCrmAndTasks`: Role-scoped team tasks and sales leads (scoped strictly to assigned user for `sales_support`; company-wide for `manager`/`owner`).
   - `queryStaffOrders`: Backoffice order fulfillment statuses, pending picking items, and BlueDart courier tracking.
3. **Mutation Prohibition Guardrail:**
   - Natural language state modifications (e.g. *"adjust stock by 10"*, *"issue refund for order"*, *"create PO"*, *"change price"*) are strictly refused.
   - Enforces the project rule: *"Stock changes go through transactional inventory services, never arbitrary counter edits."* Points staff directly to authorized signed forms in the Operations Centre.
4. **Audit Logging & Security Defenses:**
   - Filters and refuses attempts to execute prompt injections (`ignore previous instructions`, `DAN mode`, `reveal your prompt`).
   - Generates signed audit log records for staff assistant queries and denied access attempts (`STAFF_AI_QUERY`, `STAFF_AI_ACCESS_DENIED`, `STAFF_AI_SECURITY_GUARD`).
5. **Interactive Operations Copilot Drawer:**
   - Connected slide-out drawer in `/dashboard` with active staff persona selector, contextual suggested prompts, live status cards, and direct navigation links to relevant dashboard workspaces.

---

## 2. Deliverables & Implementation Details

### A. Staff Assistant Domain Service ([`src/lib/server/staff-assistant.js`](file:///c:/Users/SkyFish/OneDrive/project/nishkea/src/lib/server/staff-assistant.js))
- `queryStaffReviews({ user })`: Evaluates 30-day collection review queue using `evaluateReviewQueue()` and `getReviewQueue()`. Gated by `review:decision` or `report:view`.
- `queryStaffInventory({ user, query, lowStockOnly })`: Live physical stock query against `getVariantStockSummary()`. Checks `cost:view` permission and redacts `unitCostMinor` when unauthorized.
- `queryStaffFinance({ user })`: Computes commercial financial statement (`getFinancialSummary()`) and business performance reports (`getBusinessPerformanceReports()`). Gated by `finance:view`.
- `queryStaffCrmAndTasks({ user, query })`: Scopes team tasks (`getTasksList()`) and CRM leads (`getLeadsList()`) to user identity for `sales_support` and company-wide for elevated staff.
- `queryStaffOrders({ user, orderNumber, fulfillmentStatus })`: Retrieves order fulfillment states and courier consignments. Gated by `order:view`.
- `processStaffAssistantQuery({ message, user, sessionId })`: Pipeline evaluating authentication, length bounding (500 chars), staff rate limiting (60 req/min), prompt injections, mutation prohibition, and role-authorized tool execution.

### B. Authenticated API Endpoint ([`src/app/api/dashboard/assistant/route.js`](file:///c:/Users/SkyFish/OneDrive/project/nishkea/src/app/api/dashboard/assistant/route.js))
- Server-side authentication check via `getAuthenticatedStaff(request)`.
- Rejects unauthenticated requests with HTTP 401 Unauthorized.
- Sanitizes request bodies, enforces 500-character bounding, and passes session context to the domain service.

### C. Dashboard Copilot UI ([`src/components/dashboard/StaffAssistantDrawer.js`](file:///c:/Users/SkyFish/OneDrive/project/nishkea/src/components/dashboard/StaffAssistantDrawer.js))
- Integrated into `src/app/dashboard/page.js` with header button and bottom-right floating trigger.
- Role switcher toolbar for testing distinct staff personas (Owner, Manager, Sales Support, Inventory Specialist, Accounts).
- Rich response bubbles with security guardrail alerts, operational metrics, and quick deep links (`?tab=reviews`, `?tab=inventory`, `?tab=finance`, `?tab=orders`, `?tab=tasks`).

---

## 3. Verification & Acceptance Testing

### Acceptance Test Suite (`tests/staff-assistant.test.mjs`)
All 20 assertions pass across 9 test suites:
- **Suite 1: Authentication & Identification Gates (2/2 PASS)**
  - Unauthenticated staff query is strictly rejected with prompt to sign in.
  - Authenticated staff member recognized with role context and name.
- **Suite 2: 30-Day Collection Review Queue Scoping (2/2 PASS)**
  - Manager retrieves 30-day collection review queue with sell-through rates.
  - Sales Support lacking `review:decision` is strictly denied review queue access.
- **Suite 3: Inventory & Vault Availability Queries (2/2 PASS)**
  - Inventory specialist retrieves live available, on-hand, and reserved stock.
  - Low stock inspection evaluates vault stock against safety thresholds.
- **Suite 4: Proprietary Supplier Cost & Margin RBAC Isolation (4/4 PASS)**
  - Sales Support querying supplier cost is strictly DENIED and confidential figures withheld.
  - Inventory Staff querying commercial margins is strictly DENIED.
  - Manager possesses `cost:view` and receives verified FIFO supplier unit cost.
  - Accounts Staff possesses `finance:view` and retrieves commercial financial report.
- **Suite 5: Commercial Financial Summary & Reconciliations (1/1 PASS)**
  - Commercial financial ledgers calculate net revenue, COGS, margin % and operating surplus.
- **Suite 6: Role-Scoped CRM & Team Tasks (2/2 PASS)**
  - Sales Support query returns tasks scoped strictly to their identity.
  - Manager query returns company-wide task overview.
- **Suite 7: Mutation Prohibition Guardrail (3/3 PASS)**
  - Refuses natural language stock adjustment mutation.
  - Refuses natural language order refund mutation.
  - Refuses natural language purchase order generation.
- **Suite 8: Prompt Injection & Adversarial Defenses (2/2 PASS)**
  - Rejects "ignore previous instructions" jailbreak attempt.
  - Rejects system prompt extraction attempt.
- **Suite 9: Request Bounding & Rate Limiting (2/2 PASS)**
  - Rejects requests exceeding maximum allowable 500 characters.
  - Staff rate limiter enforces 60 requests per minute boundary.

### Project-Wide Validation
- `npm test`: **458 / 458 assertions passing** across all 11 test suites.
- `npm run lint`: `✔ No ESLint warnings or errors`.
- `npm run build`: Compiled 54 routes and static pages cleanly with zero errors.
- **Browser Visual Verification:** Verified copilot launch, 30-day review queue display, role switcher, and RBAC security denial for sales support inquiring about supplier costs (`copilot_review_query_1792668614542.png`, `rbac_sales_support_denial_1792669002197.png`, `staff_copilot_verification_1792668564548.webp`).

---

## 4. Handoff to Node 15 / Node 16

- **Node 15:** Production Preparation, Security Hardening & Launch Checklist.
- **Node 16 (Future Scope):** WooCommerce-Style Advanced Product Editor, Media Studio & Variant Matrix (detailed in `docs/NODE-15.md`).
