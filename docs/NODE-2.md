# Node 2 — Website and Dashboard Foundation Summary

## Objective
Establish the JavaScript Next.js App Router foundation for NISHKÈA, delivering separated public luxury storefront and operational backoffice shells, verified brand design tokens, responsive navigation, dynamic product cards, local cart/wishlist state, grounded AI concierge demo, and health monitoring.

## Delivered in Node 2
1. **Technology & Codebase**:
   - Next.js 15.5 App Router with React 19 in standard JavaScript (`.js` and `.jsx`). Zero TypeScript files.
   - Pinned dependencies with `package.json` and `package-lock.json`.
   - Reusable components (`ProductCard`, `PlaceholderImage`, `Header`, `Footer`, `ChatWidget`).
   - ESLint validation passing with zero warnings or errors.

2. **Design System & Brand Assets**:
   - Provisional luxury palette: Burgundy (`#701A36`), Deep Burgundy (`#55132A`), Warm Ivory (`#FAF7F2`), Pure White (`#FFFFFF`), Charcoal Text (`#241B20`), Muted Accent (`#6D6268`), Border (`#E7DDE0`), Decorative Gold (`#B69763`).
   - Contrast check: Gold restricted to decorative accents, dark text, or borders; never used as small body text on light backgrounds.
   - Restrained CSS animations (transitions 160–240ms, scale hover <=1.03) with full `prefers-reduced-motion` compliance.
   - Bespoke vector SVGs for brand wordmark, desktop/mobile hero banners, 5 category tiles, and editorial feature.

3. **Storefront Routes**:
   - `/` — Homepage with announcement bar, hero CTA, 5 category tiles, featured pieces, editorial 30-day review story, brand statement, and footer.
   - `/shop` — Interactive catalogue with category filtering, live keyword search, price/alphabetical sorting, counter, and empty-state reset.
   - `/products/[slug]` — Dynamic product detail preview with image gallery, option/variant picker, real-time stock computation (`available = sellable - reserved`), care accordion, and fictional fixture disclaimer.
   - `/wishlist` — Client-side wishlist with persistent `localStorage` fallback and move-to-bag action.
   - `/cart` — Preview shopping bag with quantity increment/decrement, minor currency subtotal arithmetic (`paise` / integer math), complimentary domestic shipping calculation, and informative checkout modal.

4. **Company Dashboard**:
   - `/dashboard` — Dedicated staff backoffice shell with desktop sidebar, collapsible mobile drawer, role indicators, and 11 operational tabs (Overview, Products, 30-Day Reviews, Inventory & Ageing, Orders, Suppliers, CRM, Tasks, Finance, Reports, Settings).
   - Fictional fixture calculations for FIFO batch ageing (0–30, 31–60, 61–90, 91+ days), sell-through rates, and pending 30-day reviews.
   - Safe planned notices on uncompleted mutations rather than false success messages.

5. **AI Concierge & Health Monitoring**:
   - Grounded demo assistant panel (`ChatWidget`) anchored at bottom-right with keyboard Escape handling, suggested pills, and deterministic responses covering jewellery care, ring sizes, return policies, and category questions.
   - Server-side adapter boundary (`/api/chat` and `src/lib/server/ai-adapter.js`) preventing client credential leaks.
   - Operational monitoring endpoint at `/api/health` returning system status, node identifier, and list of unconnected future services.

## Acceptance Gate
- Build: PASS (`next build` compiled 10 routes cleanly in 3.7s).
- Lint: PASS (`✔ No ESLint warnings or errors`).
- Production Readiness: Scaffolding and UI preview only; backend database, live payments, and real AI provider are intentionally unconnected.
