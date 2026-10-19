# Acceptance and verification plan
## Node 2 foundation
JavaScript-only source; build/lint pass; storefront/dashboard layouts separated; tokens consistent; 360px and desktop usable; keyboard focus visible; reduced motion respected; fixtures labelled; no secrets or fake functional checkout.

## Critical functional scenarios for later nodes
1. Start with 20 sellable earring pairs; reserve 5 → available 15; cancel → available 20.
2. Two concurrent orders compete for last unit → only one reservation succeeds.
3. Dispatch 2 of 5 reserved → physical stock decreases 2; 3 remain reserved.
4. Duplicate dispatch/payment webhook/job → no duplicate movement, charge or review task.
5. Receive 10 old + 10 new units; new receipt preserves old batch age and cost.
6. At review date create one review task; do not remove inventory or apply discount.
7. Mark clearance → routine reorder blocked; authorized override audited.
8. Return shipped unit → quarantine; inspection moves it to sellable once; refund independent.
9. A bundle sale consumes all components atomically or none.
10. Customer A cannot read Customer B's order by changing URL; inventory staff cannot export costs.
11. Chat injection cannot expose private records or write stock.
12. Payment success after reservation expiry triggers recheck/exception handling.
13. Money totals and rounding reconcile across discounts, refunds and reports.
14. Stock count correction preserves original history through adjustment entries.

Use unit tests for domain calculations, integration tests for transactions/authorization/webhooks and focused end-to-end tests for purchase/return journeys. Manual visual QA covers responsive layouts, accessible dialogs and loading/error states. Record actual results, not assumed PASS statuses.
