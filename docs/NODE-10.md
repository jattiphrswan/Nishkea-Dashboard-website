# Node 10: CRM, Wholesale / Retail Customer Segmentation & Sales Pipeline

## 1. Overview
Node 10 implements the Customer Relationship Management (CRM) and Team Task Operations foundation for NISHKÈA. It delivers customer profiles categorized by retail versus wholesale segmentation, an interactive sales pipeline (`ENQUIRY` → `QUALIFIED` → `QUOTATION` → `WON` / `LOST`), mandatory lost-reason enforcement, follow-up scheduling, server-side RBAC scoping (sales staff scoped to assigned accounts), an idempotent team task recurrence engine, and support ticket management.

---

## 2. Core Architectural Principles & Invariants

1. **Explicit Customer Segmentation & Separate Marketing Consent**:
   - Clients are strictly segmented into `RETAIL` or `WHOLESALE`.
   - Wholesale accounts mandate a verified company legal name and optional GSTIN (`27AABCU9603R1ZM`).
   - Marketing communication consent is stored as an explicit, separate boolean to satisfy privacy guardrails prior to automated messaging.
   - Duplicate contact review: Customer creation checks email and phone to prevent duplicate profiles.

2. **Sales Pipeline & Mandatory Lost Reason**:
   - Permitted stages: `['ENQUIRY', 'QUALIFIED', 'QUOTATION', 'WON', 'LOST']`.
   - **Mandatory Lost Reason Invariant**: Transitioning any lead to `LOST` strictly requires providing a non-empty `lostReason` explaining the decline (e.g. competitor pricing, lead time, budget constraint).
   - Commercial value is tracked in integer minor currency units (`paise`, currency `INR`).

3. **Follow-Up Scheduling & Overdue Tracking**:
   - Leads carry `nextFollowUpDate` targets.
   - Real-time pipeline metrics calculate upcoming versus overdue actions.

4. **Server-Side RBAC Scoping**:
   - `sales_support`: Restricted to viewing and editing leads and tasks assigned to them (or unassigned). Attempting to access another team member's assigned record directly is rejected with HTTP 403 Forbidden.
   - `manager` and `owner`: Unrestricted visibility across company-wide pipelines and team task boards.

5. **Idempotent Team Task Recurrence Engine**:
   - Supports `DAILY`, `WEEKLY`, and `MONTHLY` recurring task schedules.
   - Evaluates schedule elapse against `lastGeneratedDate`.
   - **Idempotency Rule**: Running the recurrence generator multiple times on the same date strictly creates zero duplicate instances, ensuring tasks generate exactly once per scheduled occurrence.

---

## 3. Database Schema Migration
Defined in [`database/migrations/003_crm_and_tasks.sql`](file:///c:/Users/SkyFish/OneDrive/project/nishkea/database/migrations/003_crm_and_tasks.sql):
- **`customers`**: Master client directory with segmentation (`RETAIL`, `WHOLESALE`), legal entity details, marketing consent, order counts, and spend.
- **`crm_leads`**: Pipeline leads with stage constraints, check constraint enforcing non-empty `lost_reason` when `stage = 'LOST'`, minor currency values, and follow-up targets.
- **`crm_activities`**: Immutable audit timeline tracking stage transitions, phone calls, quotations, and notes.
- **`support_tickets`**: Customer inquiries with order linking, category classification, and resolution workflow.
- **`tasks` (Extended)**: Added `recurrence`, `last_generated_date`, and `parent_task_id` for automated recurrence hierarchies.

---

## 4. Architectural Implementation & Deliverables

### A. Domain Engine & Business Logic
**File**: [`src/lib/server/crm.js`](file:///c:/Users/SkyFish/OneDrive/project/nishkea/src/lib/server/crm.js)
- `getCustomersList({ user, segment, search })` & `getCustomerById(id, { user })`
- `createCustomer({ name, email, phone, segment, companyName, gstNumber, marketingConsent, notes, user })`
- `getLeadsList({ user, stage, segment, ownerId })` & `getLeadById(id, { user })`
- `createLead({ title, customerName, customerEmail, customerPhone, segment, leadSource, estimatedValueMinor, ownerId, nextFollowUpDate, notes, user })`
- `updateLeadStage(id, { stage, lostReason, note, nextFollowUpDate, user })`
- `getTasksList({ user, status, priority, assigneeId })`
- `createTask({ title, priority, status, assignedTo, dueDate, linkedRecord, recurrence, user })`
- `updateTask(id, updates, { user })`
- `generateRecurringTasks({ asOfDate })`
- `getSupportTicketsList({ user, status, category })`
- `createSupportTicket({ customerName, customerEmail, subject, priority, category, linkedOrderNumber, user })`
- `resolveSupportTicket(id, { resolution, user })`

### B. REST API Endpoints
1. `GET /api/crm/customers`, `POST /api/crm/customers` ([`src/app/api/crm/customers/route.js`](file:///c:/Users/SkyFish/OneDrive/project/nishkea/src/app/api/crm/customers/route.js))
2. `GET /api/crm/customers/[id]` ([`src/app/api/crm/customers/[id]/route.js`](file:///c:/Users/SkyFish/OneDrive/project/nishkea/src/app/api/crm/customers/%5Bid%5D/route.js))
3. `GET /api/crm/leads`, `POST /api/crm/leads` ([`src/app/api/crm/leads/route.js`](file:///c:/Users/SkyFish/OneDrive/project/nishkea/src/app/api/crm/leads/route.js))
4. `GET /api/crm/leads/[id]`, `PATCH /api/crm/leads/[id]` ([`src/app/api/crm/leads/[id]/route.js`](file:///c:/Users/SkyFish/OneDrive/project/nishkea/src/app/api/crm/leads/%5Bid%5D/route.js))
5. `GET /api/crm/tasks`, `POST /api/crm/tasks`, `PATCH /api/crm/tasks` ([`src/app/api/crm/tasks/route.js`](file:///c:/Users/SkyFish/OneDrive/project/nishkea/src/app/api/crm/tasks/route.js))
6. `POST /api/crm/tasks/recurrence` ([`src/app/api/crm/tasks/recurrence/route.js`](file:///c:/Users/SkyFish/OneDrive/project/nishkea/src/app/api/crm/tasks/recurrence/route.js))
7. `GET /api/crm/support`, `POST /api/crm/support` ([`src/app/api/crm/support/route.js`](file:///c:/Users/SkyFish/OneDrive/project/nishkea/src/app/api/crm/support/route.js))

### C. Modular Backoffice UI Components
- **CRM Tab**: [`src/components/dashboard/CrmTab.js`](file:///c:/Users/SkyFish/OneDrive/project/nishkea/src/components/dashboard/CrmTab.js)
  - KPI Metrics Bar: Active Pipeline Value in ₹, Total Client Accounts, Scheduled Follow-ups (with overdue alerts), and Won Conversions.
  - Dual View Switcher: Interactive Sales Pipeline Cards vs Structured Client Directory Table.
  - Interactive Modals: *Register Customer* (with retail/wholesale toggle and marketing consent), *Create Lead* (with value and follow-up date), and *Update Pipeline Stage* (with lost-reason validation).
- **Team Tasks Tab**: [`src/components/dashboard/TasksTab.js`](file:///c:/Users/SkyFish/OneDrive/project/nishkea/src/components/dashboard/TasksTab.js)
  - Task board with status toggle buttons (`TODO`, `IN_PROGRESS`, `DONE`), priority chips, due date tracking, linked record badges, and recurrence tags.
  - "Run Recurrence Engine" button executing automated schedule evaluation.
  - Interactive Modal: *Assign Team Task*.

---

## 5. Automated Verification & Acceptance Tests
**Test Suite**: [`tests/crm.test.mjs`](file:///c:/Users/SkyFish/OneDrive/project/nishkea/tests/crm.test.mjs)
- **Suite 1: Customer Segmentation & Duplicate Protection (7 tests)**: Verified unauthenticated query rejection, retail customer creation with separate marketing consent, mandatory company name for wholesale clients, duplicate email rejection, and segment filtering.
- **Suite 2: Role Scoping & Access Control (5 tests)**: Verified sales support is restricted to assigned leads, manager has company-wide visibility, and cross-team lead inspection by sales support throws HTTP 403 Forbidden.
- **Suite 3: Lead Sales Pipeline & Lost Reason Enforcement (8 tests)**: Verified stage transitions (`ENQUIRY` → `QUALIFIED` → `QUOTATION`), rejected transition to `LOST` without reason, and accepted valid `LOST` transition with preserved notes.
- **Suite 4: Follow-up Scheduling & Pipeline Metrics (5 tests)**: Verified total leads, active pipeline value in paise, counts by stage, and overdue follow-up counting.
- **Suite 5: Team Tasks & Recurrence Engine (Idempotency) (8 tests)**: Verified task creation, RBAC guardrails on task re-assignment, recurrence generation linking parent templates, and verified zero duplicates when re-run on the same date.
- **Suite 6: Customer Support Tickets (6 tests)**: Verified ticket creation with order reference, resolution notes requirement, and status filtering.

**All 52/52 tests in `tests/crm.test.mjs` PASS (100% passing).**
**Cumulative project test suite: 328/328 tests PASS.**
