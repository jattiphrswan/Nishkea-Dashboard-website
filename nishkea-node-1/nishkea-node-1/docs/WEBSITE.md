# Public Storefront — Implementation Status

## Implemented Routes
- `/` — Editorial homepage with announcement bar, hero section, 5 category tiles, featured pieces, 30-day collection review story, and brand craftsmanship philosophy.
- `/shop` — Interactive catalogue listing with category tabs, live keyword search, price/alphabetical sorting, and empty-state fallback.
- `/products/[slug]` — Dynamic product detail preview with image gallery, option/variant picker, real-time stock computation (`available = sellable - reserved`), care accordion, and related pieces.
- `/wishlist` — Client-side wishlist with persistent `localStorage` fallback and move-to-bag action.
- `/cart` — Preview shopping bag with quantity increment/decrement, minor currency subtotal arithmetic (`paise`), complimentary shipping calculation, and informative checkout modal.

## Shopping Bag & Stock Reservation Rule
Adding items to the client-side cart does **not** create a stock reservation. Reservations are created atomically at server checkout (scheduled for Node 8). The cart UI displays an explicit disclaimer to this effect.

## Checkout Status
Checkout is intentionally offline in Node 2. Tapping "Proceed to Checkout" opens an accessible modal explaining that backend payment adapters and transactional reservations are scheduled for Node 8.
