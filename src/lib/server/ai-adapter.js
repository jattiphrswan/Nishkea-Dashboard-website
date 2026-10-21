/**
 * AI Concierge Adapter Boundary — Node 13
 *
 * Connects storefront requests to the grounded AI assistant domain engine.
 * Enforces rate limiting, privacy boundaries, prompt injection guardrails,
 * live stock/price lookups, and customer order verification.
 */

export {
  processConciergeQuery,
  searchCatalogue,
  checkVariantStock,
  lookupCustomerOrder,
  getCareAndSizingGuidelines,
  checkRateLimit,
  resetRateLimits
} from './ai-assistant.js';
