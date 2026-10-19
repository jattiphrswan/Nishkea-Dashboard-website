# Brand and Design Direction — Implementation Status

## Reference
`references/brand-reference.png` contains the original brand reference for NISHKÈA with the tagline “IT SUITS YOU !” and burgundy lettering. A scalable vector SVG asset has been implemented at `/public/images/brand/logo.svg`.

## Implemented Design Tokens (`src/app/globals.css`)
- `brand-burgundy`: `#701A36`
- `burgundy-deep`: `#55132A` (Hover and footer headers)
- `burgundy-light`: `#F7EFF2` (Badge and subtle tint backgrounds)
- `ivory`: `#FAF7F2` (Warm canvas background)
- `surface`: `#FFFFFF` (Card and modal surfaces)
- `text-main`: `#241B20` (Primary charcoal typography)
- `text-muted`: `#6D6268` (Secondary description typography)
- `border`: `#E7DDE0` (Card and divider boundaries)
- `decorative-gold`: `#B69763` (Accent stars, highlights, borders)
- `gold-light`: `#F9F5EE` (Highlight banners)

### Contrast & Usability Guardrails
Gold (`#B69763`) has a 2.8:1 contrast ratio against ivory, failing WCAG AA for normal text. It is therefore strictly used as a decorative accent, icon embellishment, or border highlight, never as body copy. Primary text relies on `#241B20` (14.2:1 contrast ratio) and `#701A36` (9.8:1 contrast ratio).

## Typography & Proportions
- Headings: Editorial serif `Cormorant Garamond` (with fallbacks: `Didot`, `Bodoni MT`, `Georgia`, `serif`).
- UI & Body: Humanist sans-serif `Manrope` (with system sans fallbacks).
- Product imagery: Consistent `1:1` aspect ratios to prevent cumulative layout shift.
- Mobile breakpoints: Fluid testing across 360px, 390px, 768px, 1024px, and 1440px.

## Motion & Accessibility
- Navigation drawer transitions: 240ms cubic-bezier.
- Product card image scale hover: 1.03 (capped under 1.04).
- Full `@media (prefers-reduced-motion: reduce)` support: overrides animation and transition durations to 0.01ms.
- Keyboard access: Visible focus ring (`outline: 2px solid var(--color-burgundy)`), Escape key closes mobile navigation and concierge dialogs.
