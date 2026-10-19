# Service/API contracts
Final route names may change in implementation; preserve these behaviors.

| Operation | Contract |
|---|---|
| GET /api/catalogue | published eligible products only; pagination/filter allowlist |
| GET /api/products/:slug | public content, variant retail prices and availability |
| POST /api/checkout | validated address/lines; server totals; idempotency key |
| POST /api/payments/webhook | raw-body signature check; event deduplication |
| GET /api/account/orders/:id | verified owner only |
| POST /api/dashboard/receipts | inventory permission; transaction + receipt ledger |
| POST /api/dashboard/adjustments | reason, quantity, location, permission/approval |
| POST /api/dashboard/reviews/:id/decision | lifecycle transition + audit + next date |
| POST /api/dashboard/returns/:id/inspect | bounded quantity, condition and disposition |
| POST /api/chat | size/rate limit, scope validation, bounded retrieval/tools |

Use structured validation; reject unknown sensitive fields. List responses carry pagination metadata. Errors have stable code, safe message, optional field errors and trace ID; no SQL or secrets. Conflicting stock returns a recoverable conflict with revised availability. Guard mutations against CSRF where cookie auth applies. External callbacks verify signatures and replay resistance. Retried requests return the original business result rather than duplicating it.
