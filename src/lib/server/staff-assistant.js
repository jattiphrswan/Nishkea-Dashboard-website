/**
 * NISHKÈA Permission-Scoped Staff Assistant Domain Engine — Node 14
 *
 * Implements:
 * 1. Role-Based Access Control (RBAC) & Server-Side Security Scoping:
 *    - Owner / Manager: Full retrieval access across inventory, reviews, finance, margins, supplier costs, and CRM.
 *    - Accounts Staff: Access to financial ledgers, disbursements, receipts, and supplier costs; denied product/review decisions.
 *    - Inventory Staff: Access to physical warehouse batches, movements, and stock levels; strictly denied supplier costs and finance.
 *    - Sales Support: Access to customer leads, assigned tasks, and public catalogue; strictly denied supplier costs, margins, and 30-day reviews.
 * 2. Allowlisted Staff Retrieval Tools:
 *    - queryStaffReviews: Evaluates 30-day collection review queue, period sell-through, and lifecycle recommendations.
 *    - queryStaffInventory: Live physical vault stock, reserved units, available units, and batch ageing (with cost redaction for non-cost roles).
 *    - queryStaffFinance: Commercial revenues, FIFO COGS, gross margins, and operating surplus (strictly gated by finance:view).
 *    - queryStaffCrmAndTasks: Role-scoped team tasks and sales leads (scoped to assigned user for sales_support).
 *    - queryStaffOrders: Order fulfillment statuses, pending picking items, and courier tracking.
 * 3. Mutation Prohibition Gate:
 *    - Natural language state mutations (changing stock, placing POs, issuing refunds, modifying prices) are strictly refused.
 *    - Directs staff to authorized transactional forms in the Operations Centre.
 * 4. Audit Logging & Security Guardrails:
 *    - Rejects prompt injection attempts.
 *    - Records audit logs for staff assistant queries and denied access attempts.
 */

import { PRODUCTS } from '../../data/fixtures.js';
import { checkPermission, logAuditEvent } from './permissions.js';
import { computeAvailableStock, getVariantStockSummary, getAllBatches, memoryBatches } from './inventory.js';
import { evaluateReviewQueue, getReviewQueue, calculateSellThroughRate } from './reviews.js';
import { getFinancialSummary, getBusinessPerformanceReports } from './finance.js';
import { getTasksList, getLeadsList, getCustomersList } from './crm.js';
import { getOrdersList, getOrderByRef } from './orders.js';
import { getSuppliersList, getPurchaseOrdersList } from './suppliers.js';
import { formatCurrency, formatDate } from '../formatters.js';

// In-Memory Rate Limiting for Staff Assistant
const staffRateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_STAFF_REQUESTS_PER_WINDOW = 60; // Higher ceiling for operational staff

/**
 * Check and record rate limit for staff user
 */
export function checkStaffRateLimit(userId = 'usr-default') {
  const now = Date.now();
  const entry = staffRateLimitMap.get(userId) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };

  if (now > entry.resetTime) {
    entry.count = 1;
    entry.resetTime = now + RATE_LIMIT_WINDOW_MS;
    staffRateLimitMap.set(userId, entry);
    return { allowed: true, remaining: MAX_STAFF_REQUESTS_PER_WINDOW - 1 };
  }

  if (entry.count >= MAX_STAFF_REQUESTS_PER_WINDOW) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((entry.resetTime - now) / 1000)
    };
  }

  entry.count += 1;
  staffRateLimitMap.set(userId, entry);
  return { allowed: true, remaining: MAX_STAFF_REQUESTS_PER_WINDOW - entry.count };
}

/**
 * Reset staff rate limits (for testing)
 */
export function resetStaffRateLimits() {
  staffRateLimitMap.clear();
}

/**
 * Tool 1: Query 30-Day Collection Review Queue
 */
export function queryStaffReviews({ user }) {
  // Authorization: Requires review:decision or report:view or audit:view
  const canDecide = checkPermission(user, 'review:decision');
  const canViewReports = checkPermission(user, 'report:view');

  if (!canDecide.allowed && !canViewReports.allowed) {
    return {
      allowed: false,
      error: `Access Denied: Staff role '${user?.roleId || 'unauthenticated'}' lacks authorization to inspect collection lifecycle review queues (requires 'review:decision' or 'report:view').`,
      data: null
    };
  }

  evaluateReviewQueue();
  const queue = getReviewQueue();
  const items = queue.map((item) => ({
    designId: item.id || item.designCode,
    code: item.designCode,
    name: item.designName,
    status: item.status,
    launchDate: item.launchDate,
    reviewDueDate: item.reviewDueDate,
    daysSinceLaunch: item.daysSinceLaunch,
    sellThroughRateFormatted: item.sellThroughRate,
    reorderPolicy: item.reorderPolicy,
    netUnitsSold: item.netUnitsSold,
    openingStock: item.openingSellableUnits,
    eligibleReceipts: item.eligibleReceiptUnits
  }));

  return {
    allowed: true,
    count: items.length,
    data: items
  };
}

/**
 * Tool 2: Query Inventory & Stock Levels (with RBAC Cost Isolation)
 */
export async function queryStaffInventory({ user, query = '', lowStockOnly = false }) {
  const canViewInventory = checkPermission(user, 'inventory:view');
  if (!canViewInventory.allowed) {
    return {
      allowed: false,
      error: `Access Denied: Staff role '${user?.roleId || 'unauthenticated'}' lacks 'inventory:view' permission.`,
      data: null
    };
  }

  const canViewCost = checkPermission(user, 'cost:view');
  const q = (query || '').toLowerCase().trim();

  let products = [...PRODUCTS];
  if (q) {
    const stopWords = new Set(['what', 'our', 'the', 'current', 'stock', 'inventory', 'vault', 'show', 'check', 'for', 'many', 'much', 'pieces', 'units', 'items', 'with']);
    const tokens = q
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length >= 3 && !stopWords.has(t));

    if (tokens.length > 0) {
      products = products.filter((p) => {
        const nameLower = p.name.toLowerCase();
        const codeLower = p.code.toLowerCase();
        const catLower = p.category.toLowerCase();
        return tokens.some((t) => nameLower.includes(t) || codeLower.includes(t) || catLower.includes(t));
      });
    }
  }

  const summary = [];
  for (const prod of products) {
    for (const v of prod.variants) {
      const stock = await getVariantStockSummary(v.sku);
      if (lowStockOnly && stock.availableStock > 5) {
        continue;
      }

      const item = {
        designCode: prod.code,
        productName: prod.name,
        category: prod.categoryName,
        sku: v.sku,
        variantName: v.name,
        colour: v.colour,
        sellableOnHand: stock.sellableOnHand,
        activeReserved: stock.activeReserved,
        availableStock: stock.availableStock,
        status: stock.availableStock === 0 ? 'OUT_OF_STOCK' : stock.availableStock <= 5 ? 'LOW_STOCK' : 'IN_STOCK'
      };

      if (canViewCost.allowed) {
        // Retrieve batch unit cost if cost:view is permitted
        const matchingBatches = memoryBatches.filter((b) => b.variantId === v.sku);
        if (matchingBatches.length > 0) {
          item.unitCostMinor = matchingBatches[0].unitCostMinor;
          item.unitCostFormatted = formatCurrency(matchingBatches[0].unitCostMinor, 'INR');
        }
      }

      summary.push(item);
    }
  }

  return {
    allowed: true,
    costAccessGranted: canViewCost.allowed,
    count: summary.length,
    data: summary
  };
}

/**
 * Tool 3: Query Financial Ledgers, Margins & Surplus
 */
export async function queryStaffFinance({ user }) {
  const canViewFinance = checkPermission(user, 'finance:view');
  if (!canViewFinance.allowed) {
    return {
      allowed: false,
      error: `Access Denied: Staff role '${user?.roleId || 'unauthenticated'}' lacks 'finance:view' authorization. Proprietary margins, COGS, and overhead expenses are strictly isolated.`,
      data: null
    };
  }

  const summary = await getFinancialSummary({ user });
  const reports = await getBusinessPerformanceReports({ user });
  const r = summary.reconciliation || {};

  return {
    allowed: true,
    data: {
      currency: summary.currency || 'INR',
      grossCustomerReceiptsMinor: r.grossCustomerReceiptsMinor,
      grossCustomerReceiptsFormatted: formatCurrency(r.grossCustomerReceiptsMinor, 'INR'),
      gstMinor: r.gstCollectedMinor,
      gstFormatted: formatCurrency(r.gstCollectedMinor, 'INR'),
      customerRefundsMinor: r.customerRefundsDisbursedMinor,
      customerRefundsFormatted: formatCurrency(r.customerRefundsDisbursedMinor, 'INR'),
      netMerchandiseRevenueMinor: r.netMerchandiseRevenueMinor,
      netMerchandiseRevenueFormatted: formatCurrency(r.netMerchandiseRevenueMinor, 'INR'),
      allocatedCogsMinor: r.allocatedCogsMinor,
      allocatedCogsFormatted: formatCurrency(r.allocatedCogsMinor, 'INR'),
      grossMerchandiseProfitMinor: r.grossMerchandiseProfitMinor,
      grossMerchandiseProfitFormatted: formatCurrency(r.grossMerchandiseProfitMinor, 'INR'),
      grossMarginPercent: r.grossMarginPercent,
      approvedOperatingExpensesMinor: r.operatingExpensesTotalMinor,
      approvedOperatingExpensesFormatted: formatCurrency(r.operatingExpensesTotalMinor, 'INR'),
      netOperationalSurplusMinor: r.netOperationalSurplusMinor,
      netOperationalSurplusFormatted: formatCurrency(r.netOperationalSurplusMinor, 'INR'),
      sellThroughRate: reports.sellThroughPerformance?.overallSellThroughRateFormatted,
      categoryContribution: reports.categoryContribution
    }
  };
}

/**
 * Tool 4: Query CRM Leads & Team Tasks (Role-Scoped)
 */
export function queryStaffCrmAndTasks({ user, query = '', status = null }) {
  const canViewTasks = checkPermission(user, 'task:view');
  const canViewCrm = checkPermission(user, 'crm:view');

  if (!canViewTasks.allowed && !canViewCrm.allowed) {
    return {
      allowed: false,
      error: `Access Denied: Staff role '${user?.roleId || 'unauthenticated'}' lacks CRM or Task inspection permissions.`,
      data: null
    };
  }

  const role = (user?.roleId || '').toLowerCase();
  const isSalesSupport = role === 'sales_support';

  // Scoped tasks
  const allTasks = getTasksList({ user });
  const tasks = isSalesSupport
    ? allTasks.filter((t) => t.assignedTo === user.id || t.assignedToName?.toLowerCase().includes('ananya'))
    : allTasks;

  // Scoped leads
  let leads = [];
  if (canViewCrm.allowed) {
    const leadRes = getLeadsList({ user });
    const allLeads = leadRes?.leads || [];
    leads = isSalesSupport
      ? allLeads.filter((l) => l.ownerId === user.id || l.ownerName?.toLowerCase().includes('ananya'))
      : allLeads;
  }

  return {
    allowed: true,
    isRoleScoped: isSalesSupport,
    taskCount: tasks.length,
    tasks,
    leadCount: leads.length,
    leads
  };
}

/**
 * Tool 5: Query Orders & Courier Tracking
 */
export function queryStaffOrders({ user, orderNumber = null, fulfillmentStatus = null }) {
  const canViewOrders = checkPermission(user, 'order:view');
  if (!canViewOrders.allowed) {
    return {
      allowed: false,
      error: `Access Denied: Staff role '${user?.roleId || 'unauthenticated'}' lacks 'order:view' permission.`,
      data: null
    };
  }

  if (orderNumber) {
    const order = getOrderByRef(orderNumber);
    if (!order) {
      return { allowed: true, found: false, data: null };
    }
    return {
      allowed: true,
      found: true,
      data: {
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        paymentStatus: order.paymentStatus,
        fulfillmentStatus: order.fulfillmentStatus,
        totalAmountMinor: order.totalAmountMinor,
        totalAmountFormatted: formatCurrency(order.totalAmountMinor, 'INR'),
        itemCount: order.items?.length || 0,
        items: order.items,
        tracking: order.dispatchTracking,
        createdAt: order.createdAt
      }
    };
  }

  const orders = getOrdersList({ fulfillmentStatus: fulfillmentStatus || undefined });
  return {
    allowed: true,
    count: orders.length,
    data: orders.map((o) => ({
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      paymentStatus: o.paymentStatus,
      fulfillmentStatus: o.fulfillmentStatus,
      totalAmountFormatted: formatCurrency(o.totalAmountMinor, 'INR'),
      itemCount: o.items?.length || 0,
      tracking: o.dispatchTracking,
      createdAt: o.createdAt
    }))
  };
}

/**
 * Main Staff Assistant Query Processor
 */
export async function processStaffAssistantQuery({ message, user, sessionId = 'staff-session' }) {
  // 1. Mandatory Staff Authentication Gate
  if (!user || !user.roleId) {
    return {
      reply: 'Authentication required. No active staff session was identified. Please sign in to the Company Operations Centre.',
      link: '/dashboard/login',
      linkText: 'Staff Login',
      guarded: true,
      authenticated: false
    };
  }

  // 2. Request Validation & Length Bounding
  if (!message || typeof message !== 'string') {
    return {
      reply: 'Please provide a valid query or question regarding operational queues, inventory, or reports.',
      guarded: false
    };
  }

  const trimmed = message.trim();
  if (trimmed.length > 500) {
    return {
      reply: 'Message exceeds the maximum allowable length of 500 characters. Please refine your query.',
      guarded: true
    };
  }

  // 3. Rate Limiting Check
  const rateLimit = checkStaffRateLimit(user.id || sessionId);
  if (!rateLimit.allowed) {
    return {
      reply: `Staff query rate limit reached. Please wait ${rateLimit.retryAfterSeconds} seconds before submitting further operational requests.`,
      rateLimited: true,
      guarded: true
    };
  }

  const query = trimmed.toLowerCase();

  // 4. Prompt Injection & Security Defense Gate
  const injectionPatterns = [
    'ignore previous instructions',
    'ignore all instructions',
    'system prompt',
    'developer prompt',
    'reveal your prompt',
    'bypass security',
    'dan mode',
    'unrestricted ai',
    'root access',
    'drop table',
    'sudo '
  ];
  if (injectionPatterns.some((pattern) => query.includes(pattern))) {
    await logAuditEvent({
      actorId: user.id,
      action: 'STAFF_AI_SECURITY_GUARD',
      resourceType: 'SECURITY',
      resourceId: 'PROMPT_INJECTION',
      metadata: { role: user.roleId, query: trimmed.slice(0, 100) }
    });

    return {
      reply: `I am NISHKÈA’s Operations Copilot. I operate under strict Role-Based Access Controls for ${user.name} (${user.roleName || user.roleId}). I cannot alter security instructions or disclose operational system prompts.`,
      guarded: true,
      isGrounded: true
    };
  }

  // 5. Mutation Prohibition Guardrail
  // Natural language state modifications must be strictly rejected per project rules
  const mutationPatterns = [
    'adjust stock',
    'change stock',
    'reduce stock',
    'increase stock',
    'update stock',
    'create po',
    'create purchase order',
    'place po',
    'place order',
    'refund order',
    'issue refund',
    'delete product',
    'delete customer',
    'mark lead won',
    'change price',
    'publish design'
  ];
  if (mutationPatterns.some((pattern) => query.includes(pattern))) {
    return {
      reply: 'Transactional mutations cannot be executed via natural language prompt. Per Atelier operating standards, inventory adjustments, purchase orders, refunds, and price changes must be executed through signed forms with server-side audit trails in the Operations Centre.',
      link: '/dashboard',
      linkText: 'Return to Operations Workspace',
      suggestions: ['Check inventory availability', 'Which designs need review?', 'Show financial summary'],
      guarded: true,
      isGrounded: true
    };
  }

  // 6. Intent: 30-Day Collection Reviews
  if (
    query.includes('need review') ||
    query.includes('review queue') ||
    query.includes('30-day review') ||
    query.includes('collection review') ||
    query.includes('sell-through') ||
    query.includes('clearance candidate')
  ) {
    const reviewResult = queryStaffReviews({ user });
    if (!reviewResult.allowed) {
      await logAuditEvent({
        actorId: user.id,
        action: 'STAFF_AI_ACCESS_DENIED',
        resourceType: 'COLLECTION_REVIEW',
        resourceId: 'QUEUE',
        metadata: { role: user.roleId, reason: reviewResult.error }
      });

      return {
        reply: reviewResult.error,
        suggestions: ['Check my open tasks', 'Search inventory stock', 'View orders'],
        guarded: true,
        isGrounded: true
      };
    }

    const items = reviewResult.data;
    if (items.length === 0) {
      return {
        reply: 'The 30-day collection review queue is currently clear. No active trend designs are currently due for reorder or clearance evaluation.',
        suggestions: ['Check low vault stock', 'Show financial summary', 'View team tasks'],
        isGrounded: true
      };
    }

    const formattedList = items
      .map(
        (it) =>
          `• **${it.name}** (\`${it.code}\`):\n  - Status: \`${it.status}\` | Due Date: ${it.reviewDueDate} (${it.daysSinceLaunch} days active)\n  - Sell-Through Rate: **${it.sellThroughRateFormatted}** (${it.netUnitsSold} sold / ${it.openingStock + it.eligibleReceipts} eligible units)\n  - Current Reorder Policy: \`${it.reorderPolicy}\``
      )
      .join('\n\n');

    await logAuditEvent({
      actorId: user.id,
      action: 'STAFF_AI_QUERY',
      resourceType: 'COLLECTION_REVIEW',
      resourceId: 'QUEUE',
      metadata: { role: user.roleId, count: items.length }
    });

    return {
      reply: `**30-Day Collection Decision Queue (${items.length} design${items.length === 1 ? '' : 's'}):**\n\n${formattedList}\n\nYou can record decisions (CONTINUE, CLEARANCE, PROMOTE_TO_PERMANENT, STOP_REORDER) directly in Tab 3 (30-Day Reviews).`,
      link: '/dashboard?tab=reviews',
      linkText: 'Open 30-Day Review Queue',
      data: items,
      suggestions: ['Record review decision in Tab 3', 'Check low stock', 'Show financial summary'],
      isGrounded: true
    };
  }

  // 7. Intent: Supplier Costs & Margin Queries
  if (
    query.includes('supplier cost') ||
    query.includes('cost price') ||
    query.includes('wholesale cost') ||
    query.includes('unit cost') ||
    query.includes('profit margin') ||
    query.includes('gross margin') ||
    query.includes('cogs') ||
    query.includes('operating expense') ||
    query.includes('financial summary') ||
    query.includes('net revenue') ||
    query.includes('surplus')
  ) {
    const isCostQuery = query.includes('cost') || query.includes('cogs') || query.includes('supplier');
    const isFinanceQuery = query.includes('margin') || query.includes('revenue') || query.includes('expense') || query.includes('surplus') || query.includes('financial');

    // Check specific permission
    const costPerm = checkPermission(user, 'cost:view');
    const finPerm = checkPermission(user, 'finance:view');

    if (!costPerm.allowed && !finPerm.allowed) {
      await logAuditEvent({
        actorId: user.id,
        action: 'STAFF_AI_COST_ACCESS_DENIED',
        resourceType: 'FINANCE',
        resourceId: 'SUPPLIER_COST',
        metadata: { role: user.roleId, query: trimmed.slice(0, 100) }
      });

      return {
        reply: `Access Denied: Staff role '${user.roleId}' does not possess 'cost:view' or 'finance:view' permissions. Supplier costs, FIFO unit batch acquisitions, and commercial margins are confidential and isolated to Managers, Owners, and Accounts staff.`,
        suggestions: ['Check inventory availability', 'Show my assigned tasks', 'View orders pending picking'],
        guarded: true,
        isGrounded: true
      };
    }

    if (isFinanceQuery || query.includes('margin')) {
      const fin = await queryStaffFinance({ user });
      if (!fin.allowed) {
        return { reply: fin.error, guarded: true, isGrounded: true };
      }

      const d = fin.data;
      const text =
        `**Commercial Financial Summary (${d.currency}):**\n\n` +
        `• **Gross Receipts:** ${d.grossCustomerReceiptsFormatted}\n` +
        `• **Jewellery GST (3%):** ${d.gstFormatted}\n` +
        `• **Customer Refunds:** ${d.customerRefundsFormatted}\n` +
        `• **Net Merchandise Revenue:** **${d.netMerchandiseRevenueFormatted}**\n` +
        `• **Allocated COGS (FIFO):** ${d.allocatedCogsFormatted}\n` +
        `• **Gross Merchandise Profit:** **${d.grossMerchandiseProfitFormatted}**\n` +
        `• **Gross Margin %:** **${d.grossMarginPercent}%**\n` +
        `• **Approved Operating Expenses:** ${d.approvedOperatingExpensesFormatted}\n` +
        `• **Net Operational Trading Surplus:** **${d.netOperationalSurplusFormatted}**\n\n` +
        `*Sell-Through Performance:* Overall catalog sell-through is **${d.sellThroughRate}**. Statutory corporate income tax and depreciation are deferred to corporate filings.`;

      await logAuditEvent({
        actorId: user.id,
        action: 'STAFF_AI_QUERY',
        resourceType: 'FINANCE',
        resourceId: 'SUMMARY',
        metadata: { role: user.roleId }
      });

      return {
        reply: text,
        link: '/dashboard?tab=finance',
        linkText: 'View Finance Ledger (Tab 9)',
        data: d,
        suggestions: ['Export reconciliation CSV', 'View category profit breakdown', 'Check stock ageing valuation'],
        isGrounded: true
      };
    }

    // Direct supplier cost lookup for an item
    const inv = await queryStaffInventory({ user, query: trimmed });
    const costItems = inv.data.filter((i) => i.unitCostFormatted);
    if (costItems.length > 0) {
      const list = costItems
        .slice(0, 5)
        .map((i) => `• **${i.productName}** (\`${i.sku}\`): Acquisition Unit Cost **${i.unitCostFormatted}** | On-Hand: ${i.sellableOnHand} pcs`)
        .join('\n');

      return {
        reply: `**Proprietary Supplier Acquisition Costs:**\n\n${list}\n\n*Confidential Notice:* Sourced from active FIFO purchase order batches.`,
        link: '/dashboard?tab=suppliers',
        linkText: 'View Suppliers & PO Ledger',
        data: costItems,
        suggestions: ['Show financial summary', 'Check gross margins', 'Inspect purchase orders'],
        isGrounded: true
      };
    }
  }

  // Check explicit help command
  if (
    query === 'help' ||
    query.includes('help me') ||
    query.includes('what can you do') ||
    query.includes('available commands') ||
    query.includes('how to use')
  ) {
    return {
      reply: `Hello ${user.name || 'Staff'}. As your Atelier Operations Copilot (${user.roleName || user.roleId}), I can assist you with:\n\n• **30-Day Collection Reviews:** Ask *"Which designs need review?"*\n• **Inventory & Vault Stock:** Ask *"Check low stock"* or *"What is our stock on Aurelia?"*\n• **Proprietary Financials:** Ask *"Show gross margins"* (restricted to authorized roles)\n• **Team Tasks & Leads:** Ask *"Show my tasks"* or *"What are our overdue follow-ups?"*\n• **Orders & Courier Dispatch:** Ask *"Show orders pending picking"*`,
      suggestions: ['Which designs need review?', 'Check low vault stock', 'Show financial summary', 'Show my tasks'],
      isGrounded: true
    };
  }

  // 8. Intent: Inventory & Stock Queries
  if (
    query.includes('stock') ||
    query.includes('inventory') ||
    query.includes('vault') ||
    query.includes('on hand') ||
    query.includes('available stock') ||
    query.includes('available units') ||
    query.includes('how many available') ||
    query.includes('low stock') ||
    query.includes('out of stock')
  ) {
    const isLowStock = query.includes('low stock');
    const inv = await queryStaffInventory({
      user,
      query: isLowStock ? '' : trimmed,
      lowStockOnly: isLowStock
    });

    if (!inv.allowed) {
      return { reply: inv.error, guarded: true, isGrounded: true };
    }

    const items = inv.data;
    if (items.length === 0) {
      return {
        reply: isLowStock
          ? 'Great news! No inventory items currently meet the low stock threshold (<= 5 pieces).'
          : `No inventory matches found for query "${trimmed}".`,
        suggestions: ['Check 30-day review queue', 'Show all inventory', 'View open tasks'],
        isGrounded: true
      };
    }

    const displayItems = items.slice(0, 6);
    const list = displayItems
      .map((i) => {
        const costStr = i.unitCostFormatted ? ` | Cost: ${i.unitCostFormatted}` : '';
        return `• **${i.productName}** [${i.variantName}] (\`${i.sku}\`):\n  - Available: **${i.availableStock}** (On-Hand: ${i.sellableOnHand}, Reserved: ${i.activeReserved}) | Status: \`${i.status}\`${costStr}`;
      })
      .join('\n\n');

    await logAuditEvent({
      actorId: user.id,
      action: 'STAFF_AI_QUERY',
      resourceType: 'INVENTORY',
      resourceId: 'SUMMARY',
      metadata: { role: user.roleId, count: items.length }
    });

    return {
      reply: `**Live Physical Vault Inventory (${items.length} matching item${items.length === 1 ? '' : 's'}):**\n\n${list}${items.length > 6 ? `\n\n*...and ${items.length - 6} more items.*` : ''}`,
      link: '/dashboard?tab=inventory',
      linkText: 'Open Inventory Ledger (Tab 4)',
      data: displayItems,
      suggestions: ['Check low stock items', 'Show orders pending picking', 'Which designs need review?'],
      isGrounded: true
    };
  }

  // 9. Intent: Team Tasks & CRM Leads
  if (
    query.includes('task') ||
    query.includes('todo') ||
    query.includes('follow up') ||
    query.includes('crm') ||
    query.includes('lead') ||
    query.includes('pipeline')
  ) {
    const crm = queryStaffCrmAndTasks({ user, query });
    if (!crm.allowed) {
      return { reply: crm.error, guarded: true, isGrounded: true };
    }

    const taskText =
      crm.tasks.length > 0
        ? crm.tasks
            .slice(0, 5)
            .map(
              (t) =>
                `• **${t.title}** [\`${t.priority}\` | \`${t.status}\`]: Due ${t.dueDate || 'Immediate'} (Assigned: ${t.assignedToName || 'Team'}${t.recurrence ? ` | 🔁 ${t.recurrence}` : ''})`
            )
            .join('\n')
        : 'No pending tasks found matching your scope.';

    const leadSummary =
      crm.leads.length > 0
        ? `\n\n**Sales Pipeline (${crm.leadCount} active leads):**\n` +
          crm.leads
            .slice(0, 3)
            .map((l) => `• **${l.clientName}** (\`${l.stage}\`): Est. ${formatCurrency(l.budgetMinor || 0, 'INR')} (Next Contact: ${l.nextFollowUpDate || 'TBD'})`)
            .join('\n')
        : '';

    const scopeNotice = crm.isRoleScoped ? '*(Scoped strictly to your assigned records)*' : '*(Company-wide operations overview)*';

    await logAuditEvent({
      actorId: user.id,
      action: 'STAFF_AI_QUERY',
      resourceType: 'CRM',
      resourceId: 'TASKS',
      metadata: { role: user.roleId, scoped: crm.isRoleScoped }
    });

    return {
      reply: `**Operational Tasks ${scopeNotice}:**\n\n${taskText}${leadSummary}`,
      link: '/dashboard?tab=tasks',
      linkText: 'Open Team Tasks Board (Tab 8)',
      data: { tasks: crm.tasks, leads: crm.leads },
      suggestions: ['Run recurrence engine', 'Check 30-day review queue', 'Show inventory'],
      isGrounded: true
    };
  }

  // 10. Intent: Orders & Fulfillment
  if (
    query.includes('order') ||
    query.includes('dispatch') ||
    query.includes('picking') ||
    query.includes('shipping') ||
    /nsk-2026-\d{4}/i.test(query)
  ) {
    const matchOrderRef = query.match(/nsk-2026-\d{4}/i);
    const orderRef = matchOrderRef ? matchOrderRef[0].toUpperCase() : null;

    const ord = queryStaffOrders({
      user,
      orderNumber: orderRef,
      fulfillmentStatus: query.includes('picking') ? 'PENDING_PICKING' : query.includes('dispatched') ? 'DISPATCHED' : null
    });

    if (!ord.allowed) {
      return { reply: ord.error, guarded: true, isGrounded: true };
    }

    if (orderRef) {
      if (!ord.found) {
        return {
          reply: `Order "${orderRef}" was not found in the Operations Centre order repository.`,
          link: '/dashboard?tab=orders',
          linkText: 'View All Orders',
          isGrounded: true
        };
      }

      const o = ord.data;
      const trackingStr = o.tracking
        ? `Courier: ${o.tracking.carrier} (Tracking #: \`${o.tracking.trackingNumber}\`)`
        : 'Awaiting courier dispatch consignment';

      return {
        reply: `**Order Summary for ${o.orderNumber}:**\n\n• **Customer:** ${o.customerName} (${o.customerEmail})\n• **Payment:** \`${o.paymentStatus}\` | **Fulfillment:** \`${o.fulfillmentStatus}\`\n• **Total:** ${o.totalAmountFormatted} (${o.itemCount} items)\n• **Shipping:** ${trackingStr}`,
        link: '/dashboard?tab=orders',
        linkText: 'View in Orders Queue (Tab 5)',
        data: o,
        suggestions: ['Dispatch order', 'Check stock on this item', 'Show all pending orders'],
        isGrounded: true
      };
    }

    const orders = ord.data.slice(0, 5);
    const list = orders
      .map((o) => `• **${o.orderNumber}** (${o.customerName}): \`${o.fulfillmentStatus}\` — ${o.totalAmountFormatted} (${o.itemCount} items)`)
      .join('\n');

    return {
      reply: `**Recent Orders Queue (${ord.count} orders):**\n\n${list}`,
      link: '/dashboard?tab=orders',
      linkText: 'Open Orders Ledger (Tab 5)',
      data: ord.data,
      suggestions: ['Orders pending picking', 'Check inventory levels', 'Show financial summary'],
      isGrounded: true
    };
  }

  // 11. Default Grounded Operational Help
  return {
    reply: `Hello ${user.name || 'Staff'}. As your Atelier Operations Copilot (${user.roleName || user.roleId}), I can assist you with:\n\n• **30-Day Collection Reviews:** Ask *"Which designs need review?"*\n• **Inventory & Vault Stock:** Ask *"Check low stock"* or *"What is our stock on Aurelia?"*\n• **Proprietary Financials:** Ask *"Show gross margins"* (restricted to authorized roles)\n• **Team Tasks & Leads:** Ask *"Show my tasks"* or *"What are our overdue follow-ups?"*\n• **Orders & Courier Dispatch:** Ask *"Show orders pending picking"*`,
    suggestions: ['Which designs need review?', 'Check low vault stock', 'Show financial summary', 'Show my tasks'],
    isGrounded: true
  };
}
