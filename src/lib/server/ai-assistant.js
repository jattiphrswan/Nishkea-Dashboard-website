/**
 * NISHKÈA Grounded Public AI Assistant Domain Engine — Node 13
 *
 * Implements:
 * 1. Allowlisted Grounded Read Tools:
 *    - searchCatalogue: filters published products by category, material, colour, budget (integer paise), salesUnit.
 *    - checkVariantStock: live transactional inventory lookup before making availability claims.
 *    - lookupCustomerOrder: privacy-gated order status and courier tracking verification.
 *    - getCareAndSizingGuidelines: grounded jewellery care and US ring sizing specifications.
 * 2. Privacy & Security Guardrails:
 *    - Strict Supplier Cost & Financial Isolation: Never reveals supplier costs, PO acquisition expenses, margins, or internal financials.
 *    - Prompt Injection Defenses: Rejects "ignore previous instructions", "jailbreak", "system prompt reveal", etc.
 *    - Customer Privacy Gate: Order tracking requires customer authentication or verified matching email.
 *    - Staff Queue Isolation: Backoffice 30-day reviews and supplier queues denied to public storefront users.
 * 3. Accurate Commercial & Policy Guardrails:
 *    - Discloses provisional shipping & return policies without fabricating claims.
 *    - Explains unavailable information rather than hallucinating policies or materials.
 *    - Provides direct non-AI contact escalation path (/contact).
 * 4. Rate Limiting & Input Sanitization:
 *    - Bounds request length (500 chars) and per-session request rate.
 */

import { PRODUCTS, CATEGORIES } from '../../data/fixtures.js';
import { getVariantStockSummary, computeAvailableStock } from './inventory.js';
import { getOrderByRef } from './orders.js';
import { getCurrentCustomer, getCustomerOrders } from './customer-auth.js';
import { formatCurrency } from '../formatters.js';

// In-Memory Rate Limiting Cache: Map<sessionId, { count, resetTime }>
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20;

/**
 * Check and record rate limit for a session/IP
 */
export function checkRateLimit(sessionId = 'default-client') {
  const now = Date.now();
  const entry = rateLimitMap.get(sessionId) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };

  if (now > entry.resetTime) {
    entry.count = 1;
    entry.resetTime = now + RATE_LIMIT_WINDOW_MS;
    rateLimitMap.set(sessionId, entry);
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1 };
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((entry.resetTime - now) / 1000)
    };
  }

  entry.count += 1;
  rateLimitMap.set(sessionId, entry);
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - entry.count };
}

/**
 * Reset rate limit cache (for testing)
 */
export function resetRateLimits() {
  rateLimitMap.clear();
}

/**
 * Tool 1: Search Catalogue & Filter by Budget / Category
 */
export function searchCatalogue({
  query = '',
  category = null,
  maxPriceMinor = null,
  colour = null,
  size = null,
  material = null
} = {}) {
  const q = (query || '').toLowerCase().trim();
  const cat = (category || '').toLowerCase().trim();

  let matches = PRODUCTS.filter((p) => p.publishState === 'published');

  if (cat) {
    const cleanCat = cat.replace(/^cat-/, '');
    matches = matches.filter((p) => {
      const pCat = p.category.toLowerCase().replace(/^cat-/, '');
      const pCatName = (p.categoryName || '').toLowerCase();
      return pCat === cleanCat || pCatName === cleanCat;
    });
  }

  if (q) {
    matches = matches.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.materials.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q)
    );
  }

  if (material) {
    const matNorm = material.toLowerCase();
    matches = matches.filter((p) => p.materials.toLowerCase().includes(matNorm));
  }

  if (maxPriceMinor && typeof maxPriceMinor === 'number') {
    matches = matches.filter((p) => p.priceMinor <= maxPriceMinor);
  }

  if (colour) {
    const colNorm = colour.toLowerCase();
    matches = matches.filter((p) =>
      p.variants.some((v) => v.colour.toLowerCase().includes(colNorm))
    );
  }

  if (size) {
    const szNorm = size.toLowerCase();
    matches = matches.filter((p) =>
      p.variants.some((v) => v.size.toLowerCase().includes(szNorm))
    );
  }

  return matches.map((p) => ({
    id: p.id,
    code: p.code,
    name: p.name,
    slug: p.slug,
    categoryName: p.categoryName,
    priceMinor: p.priceMinor,
    priceFormatted: formatCurrency(p.priceMinor, 'INR'),
    materials: p.materials,
    salesUnit: p.salesUnit,
    url: `/products/${p.slug}`,
    image: p.images?.[0]?.url || '/images/prodcuts/earring 1.png',
    variants: p.variants.map((v) => ({
      sku: v.sku,
      colour: v.colour,
      size: v.size,
      available: v.available
    }))
  }));
}

/**
 * Tool 2: Authoritative Live Stock Lookup
 * Checks transactional inventory before availability claims
 */
export async function checkVariantStock({ designCode, variantId, size, colour }) {
  let matchedProduct = null;
  let matchedVariant = null;

  for (const p of PRODUCTS) {
    const codeMatch = !designCode || p.code.toLowerCase() === designCode.toLowerCase();
    if (!codeMatch) continue;

    for (const v of p.variants) {
      if (variantId && v.sku.toLowerCase() === variantId.toLowerCase()) {
        matchedProduct = p;
        matchedVariant = v;
        break;
      }
      if (size && v.size.toLowerCase().includes(size.toLowerCase())) {
        matchedProduct = p;
        matchedVariant = v;
        break;
      }
    }
    if (matchedVariant) {
      matchedProduct = p;
      break;
    }
  }

  if (!matchedVariant && matchedProduct && (colour || size)) {
    matchedVariant = matchedProduct.variants.find((v) => {
      const matchCol = !colour || v.colour.toLowerCase().includes(colour.toLowerCase());
      const matchSz = !size || v.size.toLowerCase().includes(size.toLowerCase());
      return matchCol && matchSz;
    });
  }

  if (!matchedVariant) {
    return {
      found: false,
      product: matchedProduct ? { name: matchedProduct.name, code: matchedProduct.code } : null,
      message: 'Specified variant or size could not be located in active catalogue.'
    };
  }

  // Live transactional ledger check
  let available = matchedVariant.available;
  try {
    const summary = await getVariantStockSummary(matchedVariant.sku);
    if (summary && summary.availableUnits !== undefined) {
      available = summary.availableUnits;
    } else if (summary && summary.available !== undefined) {
      available = summary.available;
    }
  } catch {
    // In-memory fallback
    available = computeAvailableStock(matchedVariant.sellable || 0, matchedVariant.reserved || 0);
  }

  return {
    found: true,
    productName: matchedProduct?.name || 'NISHKÈA Design',
    productSlug: matchedProduct?.slug || '',
    url: matchedProduct ? `/products/${matchedProduct.slug}` : '',
    sku: matchedVariant.sku,
    colour: matchedVariant.colour,
    size: matchedVariant.size,
    available,
    inStock: available > 0,
    priceMinor: matchedProduct?.priceMinor || 0,
    priceFormatted: formatCurrency(matchedProduct?.priceMinor || 0, 'INR')
  };
}

/**
 * Tool 3: Privacy-Gated Customer Order Lookup
 */
export async function lookupCustomerOrder({ orderNumber, customerEmail, request = null }) {
  if (!orderNumber) {
    return {
      authenticated: false,
      found: false,
      error: 'Order reference number is required (e.g. NSK-2026-1082).'
    };
  }

  // 1. Check logged-in client session
  let loggedInCustomer = null;
  if (request) {
    try {
      loggedInCustomer = await getCurrentCustomer(request);
    } catch {
      // Unauthenticated
    }
  }

  const order = getOrderByRef(orderNumber.trim());
  if (!order) {
    return {
      authenticated: Boolean(loggedInCustomer),
      found: false,
      error: `Order '${orderNumber}' was not found in our records.`
    };
  }

  // 2. Privacy Check: Must match authenticated session email OR explicit verification email
  const orderEmail = order.customer?.email?.toLowerCase();
  const sessionEmail = loggedInCustomer?.email?.toLowerCase();
  const verifyEmail = customerEmail?.trim().toLowerCase();

  const isAuthorized =
    (sessionEmail && sessionEmail === orderEmail) ||
    (verifyEmail && verifyEmail === orderEmail);

  if (!isAuthorized) {
    return {
      authenticated: false,
      found: true,
      requiresVerification: true,
      error:
        'To protect customer privacy, order tracking requires verification. Please sign in to your Atelier Account at /account/login or provide the registered email used at checkout.'
    };
  }

  return {
    authenticated: true,
    found: true,
    orderNumber: order.orderNumber,
    createdAt: order.createdAt,
    customerName: order.customer?.name,
    fulfillmentStatus: order.fulfillmentStatus,
    paymentStatus: order.paymentStatus,
    totalMinor: order.orderTotalMinor || order.pricing?.grandTotalMinor || order.subtotalMinor || 0,
    totalFormatted: formatCurrency(order.orderTotalMinor || order.pricing?.grandTotalMinor || order.subtotalMinor || 0, 'INR'),
    itemCount: order.lines?.length || 0,
    items: order.lines?.map((l) => ({
      name: l.designName,
      colour: l.colour,
      size: l.size,
      quantity: l.quantity
    })),
    tracking: (order.tracking || order.dispatchTracking)
      ? {
          carrier: (order.tracking || order.dispatchTracking).carrier,
          trackingNumber: (order.tracking || order.dispatchTracking).trackingNumber,
          dispatchedAt: (order.tracking || order.dispatchTracking).dispatchedAt,
          portalUrl: `/account?tab=orders`
        }
      : null
  };
}

/**
 * Tool 4: Grounded Care & Ring Sizing Guidelines
 */
export function getCareAndSizingGuidelines(topic = '') {
  const t = topic.toLowerCase();

  if (t.includes('size') || t.includes('ring') || t.includes('measure')) {
    return {
      topic: 'RING_SIZING',
      title: 'NISHKÈA Ring Sizing & Comfort Guide',
      measurements: [
        { usSize: 'US 6', innerDiameter: '16.5 mm', circumference: '51.8 mm' },
        { usSize: 'US 7', innerDiameter: '17.3 mm', circumference: '54.4 mm' },
        { usSize: 'US 8', innerDiameter: '18.1 mm', circumference: '56.9 mm' }
      ],
      guidelines:
        'Our rings follow standard US sizing with tapered inner comfort bands. We recommend measuring the inner diameter of a well-fitting ring in millimeters or visiting a local jeweler for precision mandrel measurement. Selected cuff rings offer adjustable tension bands.'
    };
  }

  if (t.includes('care') || t.includes('clean') || t.includes('maintain') || t.includes('water')) {
    return {
      topic: 'JEWELLERY_CARE',
      title: 'Maison Jewellery Care & Archival Storage',
      storage: 'Store each piece individually in an airtight pouch or velvet presentation box to prevent metal oxidation and surface friction.',
      precautions: 'Avoid contact with water, chlorine, hand sanitizers, perfumes, and cosmetic hairsprays. Remove jewellery before showering, swimming, or sleeping.',
      cleaning: 'Gently buff metal surfaces with a dry microfiber polishing cloth after every wear. Never use abrasive chemical jewelry dips on micron gold vermeil or baroque synthetic pearls.'
    };
  }

  if (t.includes('return') || t.includes('refund') || t.includes('policy') || t.includes('exchange')) {
    return {
      topic: 'RETURN_POLICY',
      title: 'Provisional Client Return & Exchange Policy',
      windowDays: 7,
      conditions:
        'Unworn items in original security seals with tags attached may be returned within 7 days of verified courier delivery.',
      hygieneExceptions:
        'For health and hygiene safety, pierced earrings and traditional nose ornaments (naths/studs) are strictly non-returnable unless defective or transit-damaged on arrival.',
      disclaimer:
        'Note: Full statutory commercial return and cancellation terms require final business legal sign-off before official launch.'
    };
  }

  return null;
}

/**
 * Core Assistant Query Processor (Node 13)
 */
export async function processConciergeQuery({
  message,
  sessionId = 'session-guest',
  request = null
}) {
  // 1. Input Validation & Max Length Bounding
  if (!message || typeof message !== 'string') {
    return {
      reply: 'Please provide a valid question or inquiry regarding our handcrafted jewellery collections.',
      suggestions: ['Browse earrings', 'Ring sizing guide', 'Jewellery care tips'],
      isGrounded: true
    };
  }

  const trimmed = message.trim();
  if (trimmed.length > 500) {
    return {
      reply: 'Your message exceeds our allowable request length (maximum 500 characters). Please condense your inquiry so I may assist you promptly.',
      suggestions: ['Gold earrings under 3000', 'Ring sizing', 'Return policy'],
      isGrounded: true
    };
  }

  // 2. Session Rate Limiter Check
  const rateLimit = checkRateLimit(sessionId);
  if (!rateLimit.allowed) {
    return {
      reply: `You have made several rapid requests. To protect our concierge servers, please pause for ${rateLimit.retryAfterSeconds} seconds before sending another message.`,
      suggestions: ['Browse catalogue', 'Contact Atelier salon'],
      isGrounded: true,
      rateLimited: true
    };
  }

  const query = trimmed.toLowerCase();

  // 3. Security & Prompt Injection Defense Gate
  const injectionPatterns = [
    'ignore previous instructions',
    'ignore all instructions',
    'system prompt',
    'developer prompt',
    'reveal your prompt',
    'bypass security',
    'dan mode',
    'unrestricted ai',
    'sql injection',
    'drop table'
  ];
  if (injectionPatterns.some((pattern) => query.includes(pattern))) {
    return {
      reply: 'I am NISHKÈA’s Grounded Maison Concierge. I am strictly programmed to answer questions regarding our published jewellery collections, product materials, care instructions, ring sizing, and order fulfillment tracking. I cannot alter system instructions or disclose operational prompts.',
      suggestions: ['Explore Earrings', 'Ring Sizing Guide', 'Book an Atelier Consultation'],
      isGrounded: true,
      guarded: true
    };
  }

  // 4. Strict Privacy Gate: Supplier Cost & Commercial Financials
  const costPatterns = [
    'cost price',
    'supplier cost',
    'wholesale price',
    'purchase cost',
    'unit cost',
    'what did you pay your supplier',
    'show supplier',
    'profit margin',
    'gross margin',
    'operating expenses',
    'overhead expense',
    'how much profit'
  ];
  if (costPatterns.some((pattern) => query.includes(pattern))) {
    return {
      reply: 'I do not have access to proprietary supplier costs, purchase order acquisition expenses, commercial profit margins, or internal atelier financials. I can assist you with our published jewellery prices, product materials, care guidelines, or ring sizing specifications.',
      suggestions: ['Browse Earrings', 'What ring sizes are available?', 'Tell me about return policy'],
      isGrounded: true,
      guarded: true
    };
  }

  // 5. Staff Backoffice Queue & Reviews Isolation
  if (
    query.includes('designs need review') ||
    query.includes('review queue') ||
    query.includes('monthly review') ||
    query.includes('clearance candidate')
  ) {
    return {
      reply: '30-day collection lifecycle reviews and backoffice operational queues require staff credentials in the Company Operations Centre. Public guests can browse our active seasonal collections and signature permanent pieces.',
      suggestions: ['Explore Autumn Trend Edit', 'View Signature Permanent', 'Ring Sizing Guide'],
      isGrounded: true,
      guarded: true
    };
  }

  // 6. Customer Order Tracking Gate
  if (
    query.includes('track order') ||
    query.includes('my order') ||
    query.includes('order status') ||
    query.includes('where is my order') ||
    /nsk-2026-\d{4}/i.test(query)
  ) {
    const matchOrderRef = query.match(/nsk-2026-\d{4}/i);
    const orderNumber = matchOrderRef ? matchOrderRef[0].toUpperCase() : null;

    // Check if user provided an email address in the query
    const matchEmail = query.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const providedEmail = matchEmail ? matchEmail[0] : null;

    if (!orderNumber) {
      // Check if logged-in customer has recent orders
      let customerOrders = [];
      try {
        const loggedIn = await getCurrentCustomer(request);
        if (loggedIn) {
          customerOrders = getCustomerOrders(loggedIn.email);
        }
      } catch {
        // Not logged in
      }

      if (customerOrders.length > 0) {
        const latest = customerOrders[0];
        return {
          reply: `You have an active order **${latest.orderNumber}** (${latest.fulfillmentStatus}). Delivery to ${latest.shippingAddress?.city || 'your registered address'} via ${latest.dispatchTracking?.carrier || 'BlueDart Express'}. Tracking Number: ${latest.dispatchTracking?.trackingNumber || 'Processing'}.`,
          link: '/account?tab=orders',
          linkText: 'View Order in Client Portal',
          suggestions: ['Jewellery care guide', 'Return policy details', 'Explore rings'],
          isGrounded: true
        };
      }

      return {
        reply: 'To track your order, please provide your order reference number (e.g. NSK-2026-1082) along with your checkout email, or sign in to your Atelier Account.',
        link: '/account/login',
        linkText: 'Sign in to Atelier Account',
        suggestions: ['Track NSK-2026-1082', 'Sign In', 'Contact Client Support'],
        isGrounded: true
      };
    }

    // Lookup order with privacy gate
    const lookup = await lookupCustomerOrder({
      orderNumber,
      customerEmail: providedEmail,
      request
    });

    if (!lookup.found) {
      return {
        reply: `We could not locate an order with reference "${orderNumber}". Please double-check your order confirmation email or contact our atelier concierge for assistance.`,
        link: '/contact',
        linkText: 'Contact Atelier Salon',
        suggestions: ['Sign In to Account', 'Check Return Policy', 'Browse Earrings'],
        isGrounded: true
      };
    }

    if (lookup.requiresVerification) {
      return {
        reply: `To protect client privacy, order tracking for **${orderNumber}** requires verification. Please sign in to your Atelier Account or reply with both your order number and the email address used at checkout.`,
        link: '/account/login',
        linkText: 'Sign in to View Order',
        suggestions: [`Track ${orderNumber} with my email`, 'Sign In to Account', 'Contact Atelier'],
        isGrounded: true
      };
    }

    const trackingText = lookup.tracking
      ? `Dispatched via ${lookup.tracking.carrier} (Tracking #: ${lookup.tracking.trackingNumber}).`
      : 'Currently preparing for insured dispatch from our Mumbai atelier vault.';

    return {
      reply: `Order **${lookup.orderNumber}** for ${lookup.customerName} is **${lookup.fulfillmentStatus}** (Payment: ${lookup.paymentStatus}). ${trackingText} Total: ${lookup.totalFormatted} (${lookup.itemCount} item${lookup.itemCount === 1 ? '' : 's'}).`,
      link: lookup.tracking ? '/account?tab=orders' : '/account',
      linkText: 'View in Client Portal',
      suggestions: ['How to care for my pieces', 'Return policy', 'Shop more designs'],
      isGrounded: true
    };
  }

  // 7. Ring Sizing Inquiries (with Ambiguity Clarification)
  if (query.includes('size 7') || query.includes('size 6') || query.includes('size 8')) {
    const requestedSize = query.includes('size 7') ? 'US 7' : query.includes('size 6') ? 'US 6' : 'US 8';
    
    // Check if a specific ring design was named
    const namedRing = PRODUCTS.find((p) => p.category === 'rings' && query.includes(p.name.toLowerCase().split(' ')[0]));

    if (namedRing) {
      const stockCheck = await checkVariantStock({ designCode: namedRing.code, size: requestedSize });
      if (stockCheck.found && stockCheck.inStock) {
        return {
          reply: `Yes! For the **${stockCheck.productName}**, ${requestedSize} (${stockCheck.size}) currently has **${stockCheck.available} pieces available** in sellable stock at ${stockCheck.priceFormatted}.`,
          link: stockCheck.url,
          linkText: `View ${stockCheck.productName}`,
          product: {
            name: stockCheck.productName,
            price: stockCheck.priceFormatted,
            available: stockCheck.available,
            url: stockCheck.url
          },
          suggestions: ['Ring sizing guide', 'What is the return policy?', 'Browse all rings'],
          isGrounded: true
        };
      }
    }

    // Ambiguity resolution: Multiple rings exist
    const ringsWithSize = PRODUCTS.filter((p) =>
      p.category === 'rings' && p.variants.some((v) => v.size.toLowerCase().includes(requestedSize.toLowerCase()))
    );

    if (ringsWithSize.length > 0) {
      const ringList = ringsWithSize.map((r) => {
        const v = r.variants.find((vr) => vr.size.toLowerCase().includes(requestedSize.toLowerCase()));
        return `• [${r.name}](/products/${r.slug}) (${formatCurrency(r.priceMinor, 'INR')}) — ${v?.available || 0} in stock`;
      }).join('\n');

      return {
        reply: `We have multiple ring designs crafted in ${requestedSize}:\n\n${ringList}\n\nWhich ring design would you like to inspect?`,
        link: `/products/${ringsWithSize[0].slug}`,
        linkText: `View ${ringsWithSize[0].name}`,
        suggestions: ringsWithSize.map((r) => `Check ${r.name}`),
        isGrounded: true
      };
    }
  }

  // General Ring Sizing & Measurement
  if (query.includes('size') && (query.includes('ring') || query.includes('finger') || query.includes('measure') || query.includes('fit'))) {
    const sizing = getCareAndSizingGuidelines('size');
    const tableText = sizing.measurements
      .map((m) => `• **${m.usSize}**: Inner diameter ${m.innerDiameter} (Circumference: ${m.circumference})`)
      .join('\n');

    return {
      reply: `**${sizing.title}**\n\n${sizing.guidelines}\n\n${tableText}`,
      suggestions: ['Is size 7 available?', 'Browse Rings', 'Care instructions'],
      isGrounded: true
    };
  }

  // 8. Jewellery Care & Preservation
  if (query.includes('care') || query.includes('clean') || query.includes('maintain') || query.includes('water') || query.includes('tarnish')) {
    const care = getCareAndSizingGuidelines('care');
    return {
      reply: `**${care.title}**\n\n• **Storage:** ${care.storage}\n• **Precautions:** ${care.precautions}\n• **Cleaning:** ${care.cleaning}`,
      suggestions: ['Ring sizing guide', 'Return policy', 'Browse Earrings'],
      isGrounded: true
    };
  }

  // 9. Shipping, Returns & Hygiene Policy
  if (query.includes('return') || query.includes('refund') || query.includes('exchange') || query.includes('shipping') || query.includes('delivery')) {
    const policy = getCareAndSizingGuidelines('return');
    return {
      reply: `**${policy.title}**\n\n• **Return Window:** ${policy.windowDays} days from verified courier delivery for unworn pieces with intact security seals.\n• **Hygiene Exclusion:** ${policy.hygieneExceptions}\n• **Insured Shipping:** BlueDart Express insured door delivery across India (complimentary for orders ₹3,000+).\n\n*${policy.disclaimer}*`,
      link: '/contact',
      linkText: 'Contact Atelier for Inquiries',
      suggestions: ['Browse Earrings', 'Track My Order', 'Jewellery Care'],
      isGrounded: true
    };
  }

  // 10. Earring Sales Units
  if (query.includes('earring') && (query.includes('pair') || query.includes('single') || query.includes('piece'))) {
    return {
      reply: 'All NISHKÈA earrings are sold strictly by the **pair** unless explicitly designated as a "Single Ear Cuff" in the design title. Every pair arrives securely mounted on our signature burgundy presentation card inside an archival gift box.',
      link: '/shop?category=earrings',
      linkText: 'Explore Earrings Collection',
      suggestions: ['Gold earrings under 3000', 'Aurelia Filigree Chandelier', 'Care tips'],
      isGrounded: true
    };
  }

  // 11. Budget & Category Discovery (e.g. "Gold earrings under 3000")
  let targetCategory = null;
  if (query.includes('earring')) targetCategory = 'earrings';
  else if (query.includes('ring')) targetCategory = 'rings';
  else if (query.includes('necklace') || query.includes('choker') || query.includes('pendant')) targetCategory = 'necklaces';
  else if (query.includes('hair') || query.includes('scrunchie') || query.includes('clip')) targetCategory = 'hair-accessories';
  else if (query.includes('nose') || query.includes('nath')) targetCategory = 'nose-rings';

  // Extract budget (e.g., "under 3000", "under ₹2,500", "budget 2000")
  let maxPriceMinor = null;
  const budgetMatch = query.match(/(?:under|below|budget|less than)\s*(?:₹|rs\.?|inr)?\s*(\d+(?:,\d+)?)/i);
  if (budgetMatch) {
    const cleanNum = parseInt(budgetMatch[1].replace(/,/g, ''), 10);
    if (!isNaN(cleanNum) && cleanNum > 0) {
      maxPriceMinor = cleanNum * 100; // convert to paise
    }
  }

  let materialFilter = null;
  if (query.includes('gold')) materialFilter = 'gold';
  else if (query.includes('silver') || query.includes('rhodium')) materialFilter = 'silver';
  else if (query.includes('pearl')) materialFilter = 'pearl';
  else if (query.includes('velvet')) materialFilter = 'velvet';

  if (targetCategory || maxPriceMinor || materialFilter) {
    const results = searchCatalogue({
      category: targetCategory,
      maxPriceMinor,
      material: materialFilter
    });

    if (results.length > 0) {
      const topPick = results[0];
      const otherList = results
        .slice(1, 4)
        .map((p) => `• [${p.name}](${p.url}) (${p.priceFormatted})`)
        .join('\n');

      const budgetLabel = maxPriceMinor ? ` under ${formatCurrency(maxPriceMinor, 'INR')}` : '';
      const catLabel = targetCategory ? ` in ${targetCategory}` : '';

      return {
        reply: `Here are our published handcrafted pieces${catLabel}${budgetLabel}:\n\n**[${topPick.name}](${topPick.url})** — **${topPick.priceFormatted}** (${topPick.salesUnit === 'pair' ? 'Sold as pair' : 'Per piece'}). Crafted in ${topPick.materials.split(',')[0]}.\n\n${otherList ? `Other eligible designs:\n${otherList}` : ''}`,
        link: topPick.url,
        linkText: `View ${topPick.name}`,
        product: {
          name: topPick.name,
          price: topPick.priceFormatted,
          url: topPick.url,
          image: topPick.image
        },
        suggestions: results.slice(0, 3).map((p) => `View ${p.name}`),
        isGrounded: true
      };
    } else {
      return {
        reply: `I could not locate published pieces matching your criteria (${targetCategory || 'jewellery'}${maxPriceMinor ? ` under ${formatCurrency(maxPriceMinor, 'INR')}` : ''}). Would you like to explore our complete curated catalogue or schedule a bespoke consultation?`,
        link: '/shop',
        linkText: 'Explore Complete Catalogue',
        suggestions: ['Explore Earrings', 'Explore Rings', 'Book Salon Consultation'],
        isGrounded: true
      };
    }
  }

  // 12. Default Grounded Guidance
  return {
    reply: 'Welcome to NISHKÈA Maison Concierge. I am your grounded shopping guide for our 5 curated jewellery categories (Earrings, Rings, Necklaces, Hair Accessories, and Nose Rings). I can verify real-time available stock, provide ring sizing guidelines, explain jewellery care, or track your dispatched order.',
    suggestions: [
      'Gold earrings under 3000',
      'Is size 7 available?',
      'How to care for jewellery',
      'What is your return policy?'
    ],
    isGrounded: true
  };
}
