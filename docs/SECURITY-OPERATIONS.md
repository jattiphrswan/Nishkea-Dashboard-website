# Security and operations
Use an established authentication solution with secure HTTP-only cookies, session expiry/revocation, password recovery and staff MFA support. Secrets stay out of source, browser bundles, logs and chat. Validate inputs/uploads, limit file size/type, use safe output rendering and protect mutations. Apply least-privilege database/storage credentials and server-side object authorization.

Separate development/staging/production; fictional data outside production. Store uploaded media privately until approved; serve approved public media via optimized delivery. Limit public endpoint abuse and bot/chat spend without blocking legitimate shopping.

Back up database and media on a defined schedule; define recovery-point and recovery-time targets before launch. Perform a documented restore test. Monitor failed jobs, webhook errors, stock conflicts, reservation backlog, payment mismatches and application errors. Redact personal data. Keep audit events tamper-resistant and retention-limited.

Define privacy notice, data retention, support access and deletion/export process with the business. Final jurisdiction-specific policy/tax requirements need separate verification before launch. No unverified legal text in production.
