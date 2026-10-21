# Node 11: Client Storefront Accounts, Self-Service Portal, Order Tracking & Contact Enquiries

## 1. Overview
Node 11 introduces the client-facing account portal and atelier contact system for NISHKÈA. Clients can register and securely authenticate, view their past bespoke orders and real-time shipment courier tracking, manage their profile and delivery addresses, and securely update their account password through a verified old-password check gate. Additionally, a dedicated luxury Contact & Private Consultation page allows clients to request bespoke bridal/custom jewelry appointments, with automatic synchronization into the operations CRM lead pipeline.

---

## 2. Core Architectural Principles & Invariants

1. **Client Session Isolation**:
   - Customer authentication uses a dedicated HTTP-only cookie (`nishkea_customer_session`) completely isolated from operational staff sessions (`nishkea_staff_session`).
   - Clients cannot access backoffice `/dashboard` routes, and staff sessions cannot accidentally alter client profiles.

2. **PBKDF2 Salted Password Security**:
   - Client passwords are encrypted using salted PBKDF2 with SHA-512 and 100,000 iterations.
   - Plaintext passwords and hashes are strictly excluded from API responses and client payloads (`{ passwordHash: _discard, ...safeCustomer }`).

3. **Current Password Verification Invariant**:
   - Updating an account password strictly requires submitting the valid `currentPassword`.
   - The server verifies the current password hash using timing-safe buffer comparison (`verifyPassword`) before permitting any password rotation.
   - New passwords must meet length criteria (minimum 6 characters).

4. **Real-Time Order & Shipment Tracking**:
   - Client orders provide live status progression: `Payment Verified` → `Vault Allocated` → `Dispatched` → `Out for Delivery`.
   - Integrated carrier tracking details (BlueDart Express airway bill numbers) allow clients to monitor deliveries in real time.

5. **Storefront Inquiry to CRM Pipeline Automation**:
   - Submissions on the `/contact` private consultation form are persisted in `contact_inquiries` and automatically generate a new lead in `crm_leads` with source `WEBSITE` and estimated bespoke value.
   - Operations staff can immediately review and action new appointments on Tab 7 (CRM) of the operational dashboard.

---

## 3. Database Schema Migration
Defined in [`database/migrations/004_customer_accounts.sql`](file:///c:/Users/SkyFish/OneDrive/project/nishkea/database/migrations/004_customer_accounts.sql):
- **`customers` (Extended)**: Added `password_hash`, `address_line1`, `address_line2`, `city`, `state`, `postal_code`, `country`, and `auth_provider`.
- **`customer_sessions`**: Session token records with SHA-256 token hashing, customer ID foreign key, and expiration timestamps.
- **`contact_inquiries`**: Stores consultation submissions, preferred showroom location (`MUMBAI_ATELIER`, `JAIPUR_ATELIER`, `VIRTUAL_CONCIERGE`), inquiry type, and resolution status.

---

## 4. Architectural Implementation & Deliverables

### A. Customer Auth & Tracking Domain Service
**File**: [`src/lib/server/customer-auth.js`](file:///c:/Users/SkyFish/OneDrive/project/nishkea/src/lib/server/customer-auth.js)
- `registerCustomerAccount({ name, email, phone, password, address })`: Validates details, checks duplicate email, hashes password, creates customer session, and syncs to CRM directory.
- `authenticateCustomer(email, password)`: Verifies PBKDF2 hash and issues 7-day session token.
- `getCurrentCustomer(request)`: Resolves active client from cookie or Authorization header.
- `updateCustomerProfile(customerId, updates)`: Updates name, phone, and address lines, synchronizing changes to CRM.
- `updateCustomerPassword(customerId, { currentPassword, newPassword })`: Enforces current password validation invariant before rotating hash.
- `getCustomerOrders(email)`: Retrieves itemized order history and BlueDart shipment tracking status.
- `submitContactInquiry(inquiryData)`: Records consultation request and dispatches lead into CRM pipeline.

### B. REST API Endpoints
- `POST /api/account/register` ([`src/app/api/account/register/route.js`](file:///c:/Users/SkyFish/OneDrive/project/nishkea/src/app/api/account/register/route.js)): Client self-registration.
- `POST /api/account/login` ([`src/app/api/account/login/route.js`](file:///c:/Users/SkyFish/OneDrive/project/nishkea/src/app/api/account/login/route.js)): Client credentials verification and cookie issuance.
- `POST /api/account/logout` ([`src/app/api/account/logout/route.js`](file:///c:/Users/SkyFish/OneDrive/project/nishkea/src/app/api/account/logout/route.js)): Session termination and cookie invalidation.
- `GET, PUT /api/account/me` ([`src/app/api/account/me/route.js`](file:///c:/Users/SkyFish/OneDrive/project/nishkea/src/app/api/account/me/route.js)): Session customer profile retrieval and address updates.
- `PUT /api/account/password` ([`src/app/api/account/password/route.js`](file:///c:/Users/SkyFish/OneDrive/project/nishkea/src/app/api/account/password/route.js)): Verified password change gate.
- `GET /api/account/orders` ([`src/app/api/account/orders/route.js`](file:///c:/Users/SkyFish/OneDrive/project/nishkea/src/app/api/account/orders/route.js)): Authenticated client orders with courier tracking.
- `POST /api/contact` ([`src/app/api/contact/route.js`](file:///c:/Users/SkyFish/OneDrive/project/nishkea/src/app/api/contact/route.js)): Storefront contact inquiry dispatch.

### C. Storefront User Interface
- **Contact Page** ([`src/app/(storefront)/contact/page.js`](file:///c:/Users/SkyFish/OneDrive/project/nishkea/src/app/%28storefront%29/contact/page.js)):
  - Private consultation booking form with type selection (Bespoke Jewellery, Bridal Trousseau, Gemstone Sourcing, Atelier Visit).
  - Flagship showroom cards for Mumbai Atelier (Worli) and Jaipur Heritage Studio (Johari Bazaar).
  - Direct concierge phone, email, and private viewing hours.
- **Client Login & Register** ([`src/app/(storefront)/account/login/page.js`](file:///c:/Users/SkyFish/OneDrive/project/nishkea/src/app/%28storefront%29/account/login/page.js)):
  - Mode toggle between Sign In and Create Account.
  - 1-Click test credentials auto-fill (`aditi.sharma@example.com` / `ClientPassword2026!`).
  - Clear navigation bridge to backoffice staff login.
- **Client Atelier Dashboard** ([`src/app/(storefront)/account/page.js`](file:///c:/Users/SkyFish/OneDrive/project/nishkea/src/app/%28storefront%29/account/page.js)):
  - Tab 1: **My Orders & Tracking** — Order status badges, BlueDart tracking numbers, item breakdowns, and 4-step progress stepper.
  - Tab 2: **Profile & Addresses** — Client contact details and delivery shipping address management.
  - Tab 3: **Password & Security** — Current password verification gate, new password entry, and session security overview.
  - Tab 4: **Concierge & Support** — Direct atelier assistance, private consultation booking, and phone concierge.
- **Storefront Navigation** ([`src/components/storefront/Header.js`](file:///c:/Users/SkyFish/OneDrive/project/nishkea/src/components/storefront/Header.js)):
  - Linked `Contact` to `/contact` and User icon to `/account`.

---

## 5. Verification & Acceptance Testing

### A. Automated Acceptance Suite
Run via:
```bash
node tests/customer-account.test.mjs
```
- **Registration & Validation**: Required fields verification, duplicate email rejection, minimum password length enforcement.
- **Authentication**: Seed client credentials, session issuance, invalid password rejection, cookie authentication.
- **Profile & Address Updates**: Name/phone updates, address merge, CRM synchronization.
- **Password Verification Gate**: Rejection of invalid current password, acceptance of verified current password, post-rotation authentication check.
- **Order History & Tracking**: Order retrieval for seed client, courier carrier & tracking number verification, isolated empty state.
- **Contact Inquiries**: Consultation submission, inquiry persistence, automatic CRM lead creation.
- **Result**: 42 / 42 assertions passing (100%).

### B. Full Test Suite & Lint
- `npm test`: **370 / 370 tests passing** across all 8 test suites.
- `npm run lint`: **0 warnings, 0 errors**.
- `npm run build`: All **55 routes** compiled cleanly in Next.js 15 App Router.

### C. Live Browser Verification
Visual validation recorded via Chromium subagent (`client_portal_verify_1792580545133.webp`):
1. `/contact`: Booked private bridal consultation for Kavita Singhania; verified "Inquiry Received" confirmation banner.
2. `/account/login`: Loaded luxury portal login; 1-click auto-filled Aditi Sharma; signed in successfully.
3. `/account`:
   - Viewed active order `NSK-2026-1082` with BlueDart tracking stepper (`In Transit`).
   - Inspected delivery address fields on Profile tab.
   - Inspected secure password rotation form on Security tab.
