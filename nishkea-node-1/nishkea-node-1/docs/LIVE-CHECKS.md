# NISHKÈA — Live & Local Verification Guide

## Local Development Commands

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Linting
```bash
npm run lint
```
*Expected result:* `✔ No ESLint warnings or errors`

### 3. Production Build
```bash
npm run build
```
*Expected result:* Successful static generation of 10 routes with zero errors.

### 4. Start Production Server Locally
```bash
npm run start
```
*Application runs at:* `http://localhost:3000`

### 5. Start Development Server with Fast Refresh
```bash
npm run dev
```

---

## Endpoint Verification Checklist

| Endpoint | Method | Expected Output / Behavior |
|---|---|---|
| `http://localhost:3000/` | GET | Storefront home page with announcement bar, hero, category tiles, and brand story. |
| `http://localhost:3000/shop` | GET | Full catalogue with live filtering by category, search bar, and sorting. |
| `http://localhost:3000/products/aurelia-filigree-chandelier-drops` | GET | Product detail page with image gallery, variant selection, and care details. |
| `http://localhost:3000/wishlist` | GET | Saved items view with remove and add-to-bag actions. |
| `http://localhost:3000/cart` | GET | Shopping bag with minor unit arithmetic, shipping threshold check, and checkout modal. |
| `http://localhost:3000/dashboard` | GET | Company dashboard with sidebar navigation and 11 operational workspace modules. |
| `http://localhost:3000/api/health` | GET | JSON payload: `status: "healthy"`, `node: "node-2-scaffold"`, list of unconnected services. |
| `http://localhost:3000/api/chat` | POST | JSON payload: grounded concierge responses for care, ring size, or return policy. |
| `http://localhost:3000/invalid-route` | GET | Luxury custom 404 page with return to home or shop options. |
