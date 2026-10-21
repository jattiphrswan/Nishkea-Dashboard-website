# Node 13 — Grounded Public AI Assistant

**Status:** COMPLETE / PASS  
**Date:** 2026-10-21  
**Lead:** Senior Full-Stack Architecture Specialist  
**Relevant Rules:** `AGENTS.md`, `docs/AI-CHATBOT.md`, `docs/DECISIONS.md` (D08, D19)

---

## 1. Executive Summary

Node 13 implements the **Grounded Public AI Assistant** for NISHKÈA. Designed with rigorous accuracy and privacy guardrails per `docs/AI-CHATBOT.md` and `AGENTS.md`:

1. **Grounded Read Tools & Zero Fabrication:**
   - Real-time catalogue search filtered by category, material, colour, and integer minor budget (`maxPriceMinor` in paise).
   - Authoritative live stock lookup before claiming availability, querying transactional inventory balances (`getVariantStockSummary` / `computeAvailableStock`).
   - Sizing ambiguity resolution: Ambiguous inquiries (e.g. *"Is size 7 available?"*) query all ring designs offering that size and present real stock levels rather than guessing.
   - Grounded jewellery care (storage in airtight pouches, avoiding water/perfumes, microfiber polishing) and US ring sizing specifications with millimeter inner diameters.
   - All recommended products provide exact deep links (`/products/${slug}`).
2. **Strict Privacy, Financial & Operational Isolation:**
   - Public storefront users NEVER receive supplier costs, purchase order acquisition expenses, commercial profit margins, or internal financials.
   - 30-day collection review queues and backoffice operational queues are strictly restricted to authenticated backoffice staff.
   - Customer Order Tracking Privacy Gate: Inspecting order fulfillment or courier tracking numbers requires either an active client session cookie (`nishkea_customer_session`) or explicit verification against the registered checkout email. Unauthenticated users cannot probe other clients' orders.
3. **Prompt Injection & Adversarial Defenses:**
   - Filters and refuses attempts to execute prompt injections (`ignore previous instructions`, `DAN mode`, `reveal your system prompt`, `bypass security`).
   - Treated strictly as untrusted data, never as execution instructions.
4. **Transparent Policy Grounding & Human Escalation:**
   - Discloses provisional 7-day return policy for unworn pieces in security seals, isolating pierced earrings and nose ornaments for hygiene safety.
   - Clearly disclaims that statutory return terms await formal pre-launch sign-off.
   - Provides non-AI contact and private salon booking paths (`/contact`) without fabricating claims that a human was notified until submission succeeds.
5. **Session Rate Limiting & Bounding:**
   - Sliding-window rate limiter per session/IP (maximum 20 requests per minute).
   - Maximum prompt length limit enforced (500 characters).

---

## 2. Deliverables & Implementation Details

### A. Grounded AI Assistant Domain Service ([`src/lib/server/ai-assistant.js`](file:///c:/Users/SkyFish/OneDrive/project/nishkea/src/lib/server/ai-assistant.js))
- `searchCatalogue({ query, category, maxPriceMinor, colour, size, material })`: Queries published products, filters strictly by integer minor budget and category, formats prices in INR, and includes variant summaries.
- `checkVariantStock({ designCode, variantId, size, colour })`: Checks transactional stock before making any availability claims.
- `lookupCustomerOrder({ orderNumber, customerEmail, request })`: Privacy-gated order lookup with session cookie validation or matching email verification.
- `getCareAndSizingGuidelines(topic)`: Grounded care instructions and US ring sizing chart (US 6: 16.5mm, US 7: 17.3mm, US 8: 18.1mm).
- `checkRateLimit(sessionId)`: In-memory sliding-window rate limiter (20 requests/min).
- `processConciergeQuery({ message, sessionId, request })`: Core pipeline evaluating input length, rate limits, injection patterns, privacy boundaries, order queries, ring sizing lookups, care instructions, and catalogue discovery.

### B. Updated Server Boundary ([`src/app/api/chat/route.js`](file:///c:/Users/SkyFish/OneDrive/project/nishkea/src/app/api/chat/route.js))
- Validates request payload, bounds message length to 500 characters, passes request context for authenticated customer sessions, and returns HTTP 429 when rate-limited.
- Maintains `src/lib/server/ai-adapter.js` for backwards compatibility.

### C. Luxury Maison Chatbot UI ([`src/components/chatbot/ChatWidget.js`](file:///c:/Users/SkyFish/OneDrive/project/nishkea/src/components/chatbot/ChatWidget.js))
- Upgraded from "Node 2 Demo" to active **Node 13 Grounded Maison Concierge**.
- Renders rich product preview cards when products are recommended (title, price, available units, direct "View Piece →" action).
- Top header with quick link to private salon bookings (`/contact`).
- Interactive suggestion pills based on conversational context.
- Error state with fallback link to human concierge.

---

## 3. Verification & Acceptance Testing

### Acceptance Test Suite (`tests/ai-assistant.test.mjs`)
All 22 assertions pass across 9 test suites:
- **Suite 1: Catalogue Search & Budget Filtering (3/3 PASS)**
  - Gold earrings under 3000 returns Aurelia Chandelier Drops and deep link.
  - `searchCatalogue` filters strictly by integer paise price (`priceMinor <= 200000`).
  - Returns empty array when budget is impossible.
- **Suite 2: Authoritative Live Stock & Availability Verification (3/3 PASS)**
  - Transactional inventory check accurately verifies positive available stock for Celeste Marquise Size 7.
  - Ambiguous size inquiry presents eligible ring designs offering that size.
  - Rejects non-existent sizes without fabricating stock.
- **Suite 3: Ring Sizing & Jewellery Care Grounding (3/3 PASS)**
  - Documents exact millimeter inner diameters for US 6, 7, and 8.
  - Grounds care instructions (airtight storage, avoiding moisture/perfumes, microfiber polishing).
  - Clarifies that earrings are sold strictly by the pair.
- **Suite 4: Prompt Injection & System Disclosure Defenses (2/2 PASS)**
  - Blocks "ignore previous instructions" jailbreak attempt.
  - Blocks developer prompt extraction request.
- **Suite 5: Privacy Guardrail: Supplier Costs & Financial Isolation (2/2 PASS)**
  - Refuses supplier cost / wholesale price queries and never leaks cost figures.
  - Refuses commercial margin and operational overhead probes.
- **Suite 6: Privacy Guardrail: Staff Backoffice Queue Isolation (1/1 PASS)**
  - Restricts 30-day collection review queues to staff credentials in Operations Centre.
- **Suite 7: Customer Order Tracking Privacy Gate (4/4 PASS)**
  - Unauthenticated order tracking requires email or session verification.
  - Rejects order lookup when verification email does not match order record.
  - Verified email match returns order fulfillment and BlueDart Express tracking.
  - Natural language tracking with email verification returns live courier tracking.
- **Suite 8: Policy Accuracy & Non-AI Escalation Path (2/2 PASS)**
  - Grounded return policy isolates pierced earrings and nose ornaments for hygiene safety.
  - Escalates salon inquiries to human booking path without fake claims.
- **Suite 9: Request Bounding & Rate Limiting (2/2 PASS)**
  - Rejects requests exceeding maximum allowable 500 characters.
  - Enforces 20 requests per minute boundary.

### Project-Wide Validation
- `npm test`: **438 / 438 assertions passing** across all 10 test suites.
- `npm run lint`: `✔ No ESLint warnings or errors`.
- `npm run build`: Compiled 53 routes and static pages cleanly with zero errors.
- **Browser Visual Verification:** Verified chat widget launch, catalogue budget search card, size availability, and prompt injection refusal in Chromium (`concierge_opened_1792584653867.png`, `concierge_search_result_1792584668396.png`, `concierge_security_guardrail_1792584713528.png`).

---

## 4. Handoff to Node 14 / Node 15

- **Node 14 (Optional):** Permission-Scoped Staff Assistant (private retrieval authorization checks in dashboard).
- **Node 15:** Production Preparation and Launch Checklist.
- **Node 16 (Future Scope):** WooCommerce-Style Advanced Product Editor, Media Studio & Variant Matrix (documented in `docs/NODE-15.md`).
