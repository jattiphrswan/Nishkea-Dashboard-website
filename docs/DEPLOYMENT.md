# NISHKÈA — Production Deployment & Cloud Operations Guide

This guide details the end-to-end production setup, Cloud PostgreSQL database provisioning (Neon / Supabase), environment variable configuration, automated schema deployment, and cloud hosting (Vercel / Node.js).

---

## 1. Hosting Architecture Overview

NISHKÈA runs on **Next.js 15 (App Router)** with **React 19** using pure JavaScript. Because the application includes authenticated REST API routes (`/api/auth/*`, `/api/products/*`, `/api/inventory/*`, `/api/chat`), server-side HTTP-only cookie sessions, and transactional PostgreSQL queries, it requires a full Node.js runtime environment.

- **Primary Cloud Host:** [Vercel](https://vercel.com) (configured via `vercel.json` with Mumbai `bom1` and Singapore `sin1` edge regions).
- **Alternative Node Hosts:** AWS (ECS/App Runner), DigitalOcean App Platform, Render, or Docker container.
- **Relational Storage:** Cloud PostgreSQL (Neon Serverless or Supabase).

---

## 2. Cloud PostgreSQL Setup (Neon or Supabase)

### Option A: Neon (Serverless PostgreSQL — Recommended)
1. Sign up or log in at [neon.tech](https://neon.tech).
2. Create a new project (e.g., `nishkea-production`).
3. Select region: **Asia Pacific (Singapore)** or closest to India.
4. From the Neon Console dashboard, copy your pooled connection string:
   ```text
   postgresql://neondb_owner:[PASSWORD]@ep-xyz-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```

### Option B: Supabase
1. Sign up or log in at [supabase.com](https://supabase.com).
2. Create a new project (e.g., `nishkea-atelier`).
3. Set your database password and select **South Asia (Mumbai)** or **Southeast Asia (Singapore)**.
4. In Project Settings > Database > Connection Pooling, copy the **Transaction Mode (Port 6543)** URI:
   ```text
   postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
   ```

---

## 3. Local Environment & Automated Setup

### Step 1: Create Local Environment File
Create `.env.local` in the project root:
```ini
# Cloud PostgreSQL Connection (Replace with your actual Neon or Supabase URI)
DATABASE_URL="postgresql://[USER]:[PASSWORD]@[HOST]/[DATABASE]?sslmode=require"

# Serverless connection pool limit (defaults to 10)
PG_MAX_CONNECTIONS=10

# Generate 256-bit random key via: openssl rand -hex 32
AUTH_SECRET="a84f3c7e19d28b5e40619a0f3d6c827b1e4f905283746a5c2e1f0b9d8c7a6e5f"

# Application Base URL
APP_BASE_URL="http://localhost:3000"
```

### Step 2: Automated One-Command Database Setup
Run the unified setup command to verify connectivity, apply all migrations, and seed initial data:
```bash
npm run db:setup
```
This single command sequentially:
1. Executes `database/migrate.js` (applying migrations `001` through `005` inside atomic ACID transactions).
2. Executes `database/seed.js` (seeding RBAC roles, granular permissions, default staff accounts, and core jewellery categories).
3. Executes `database/verify-connection.js` (validating connectivity, latency, schema integrity, and table counts).

### Step 3: Granular Database CLI Tools
- **Test connection only:** `npm run db:verify`
- **Run migrations only:** `npm run db:migrate`
- **Seed initial data only:** `npm run db:seed`
- **Verify backup checksums & disaster recovery:** `npm run db:backup-test`

---

## 4. Deploying to Vercel

### Step 1: Connect GitHub Repository
1. Log into your [Vercel Dashboard](https://vercel.com).
2. Click **Add New** > **Project**.
3. Import the GitHub repository: `jattiphrswan/Nishkea-Dashboard-website`.

### Step 2: Configure Environment Variables
Under **Environment Variables**, add:
| Variable Name | Value / Description | Environment |
|---|---|---|
| `DATABASE_URL` | Your Cloud PostgreSQL connection string (with `?sslmode=require`) | Production, Preview, Development |
| `AUTH_SECRET` | 64-character random hex string (`openssl rand -hex 32`) | Production, Preview, Development |
| `APP_BASE_URL` | `https://nishkea.com` (or your assigned Vercel URL `https://*.vercel.app`) | Production |
| `PG_MAX_CONNECTIONS` | `10` | Production, Preview |

### Step 3: Build & Deploy Settings
Vercel automatically detects Next.js using `vercel.json`:
- **Framework Preset:** Next.js
- **Build Command:** `next build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`
- **Edge Regions:** `bom1` (Mumbai, India) & `sin1` (Singapore)

Click **Deploy**.

---

## 5. Post-Deployment Verification Checklist

Once deployed, verify operational readiness across these live endpoints:

1. **System Health Check:**
   - URL: `https://[your-domain]/api/health`
   - Expected output:
     ```json
     {
       "status": "healthy",
       "application": "NISHKÈA Luxury Jewellery Atelier & Operations Centre",
       "node": "node-15-production-readiness",
       "systemDiagnostics": {
         "node3_database": {
           "status": "CONNECTED",
           "engine": "PostgreSQL 16 Relational Storage",
           "latencyMs": 42,
           "tableCount": 32
         }
       }
     }
     ```

2. **Public Luxury Storefront:**
   - Home: `https://[your-domain]/` (Hero video/image, 3D OptionWheel, Editorial Bento, Category Tiles).
   - Shop: `https://[your-domain]/shop` (Filters, minor unit paise pricing).
   - Product Details: `https://[your-domain]/products/aurelia-filigree-chandelier-drops` (Variants, lightbox gallery).
   - Client Portal: `https://[your-domain]/account` (Orders & tracking).

3. **Operations Centre (Backoffice Dashboard):**
   - URL: `https://[your-domain]/dashboard/login`
   - Default Seeded Staff Accounts (password: `NishkeaDemoPassword2026!`):
     - **Owner:** `owner@nishkea.internal` (Full access to all 11 tabs, financials, margins)
     - **Manager:** `manager@nishkea.internal` (Operations, inventory receipts, 30-day reviews)
     - **Inventory Specialist:** `inventory@nishkea.internal` (Stock ledger, batch intake; costs isolated)
     - **Sales & Support:** `sales@nishkea.internal` (Orders, CRM leads; costs isolated)

---

## 6. Security & Operational Policies in Production

1. **Never Expose Credentials:**
   - Raw database connection strings, passwords, and supplier costs are strictly isolated server-side.
   - Client bundles receive zero secret tokens.
2. **Integer Minor Currency Invariant:**
   - All transactions, ledgers, cart totals, and catalogue prices remain strictly in integer minor units (`paise`, INR).
3. **Transactional Inventory Service:**
   - Physical stock deductions and reservation holds route exclusively through transactional inventory services; arbitrary counter edits are prohibited.
4. **Disaster Recovery (RTO < 60s, RPO 0):**
   - Execute `npm run db:backup-test` before any database schema migration or production release.
