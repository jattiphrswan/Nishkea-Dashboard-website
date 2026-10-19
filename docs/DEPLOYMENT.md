# Deployment & Operations Guide

## Current Node 2 Status
Node 2 provides the standalone Next.js App Router codebase. No remote server or cloud account has been billed or launched.

## Local Runtime Verification
- Node version: `>=18` (Tested on Node `v22.15.1`)
- Package manager: `npm` (Tested with npm `11.19.1`)
- Install: `npm install`
- Lint: `npm run lint`
- Build: `npm run build`
- Start: `npm run start`

## Environment Configuration
Template provided at `.env.example` with variable names only. No live secrets or API keys are committed to the codebase:
- `DATABASE_URL` (Node 3)
- `AUTH_SECRET` (Node 3)
- `APP_BASE_URL` (Default: `http://localhost:3000`)
- `MEDIA_STORAGE_BUCKET` (Node 4)
- `PAYMENT_PROVIDER_KEY` / `PAYMENT_PROVIDER_SECRET` / `PAYMENT_WEBHOOK_SECRET` (Node 8)
- `AI_PROVIDER_API_KEY` / `AI_MODEL` (Node 12)
- `JOB_AUTH_SECRET` (Node 5/6)
- `EMAIL_PROVIDER_KEY` (Node 10)

## Target Hosting Architecture
Next.js App Router requires a Node.js server environment (such as Vercel, AWS ECS/Amplify, DigitalOcean App Platform, or custom Docker container) to execute server API routes (`/api/chat`, `/api/health`) and dynamic server-rendered pages. Static-only hosting (e.g. basic GitHub Pages) cannot execute server-side adapters or authenticated routes.
