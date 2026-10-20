/**
 * NISHKÈA 30-Day Collection Reviews & Lifecycle Engine — Node 6
 *
 * Implements business rules per docs/PRODUCT.md and docs/INVENTORY.md:
 * 1. Default review interval is 30 calendar days from launch.
 * 2. Idempotent evaluation: Due reviews set status to 'under_review' and generate
 *    tasks without duplicate entries or unintended price/stock modifications.
 * 3. Period Sell-Through Rate = Net Units Sold / (Opening Sellable + Receipts in Period).
 * 4. Permitted review decisions:
 *    - 'CONTINUE' (Extend review window by 30 days)
 *    - 'PROMOTE_TO_PERMANENT' (Move to permanent line, allow auto reorders)
 *    - 'STOP_REORDER' (Sell down remaining stock, block reordering)
 *    - 'CLEARANCE' (Move to clearance status, block regular reorders)
 *    - 'DISCONTINUE' (End sales immediately, preserve order history)
 *    - 'SUPPLIER_RETURN' (Quarantine unsold units for vendor return)
 * 5. Full audit logging for every lifecycle decision.
 */

import { query } from './db.js';
import { checkPermission, logAuditEvent } from './permissions.js';

export const REVIEW_CONFIG = {
  defaultIntervalDays: 30,
  reminderDays: [7, 1],
  validDecisions: [
    'CONTINUE',
    'PROMOTE_TO_PERMANENT',
    'STOP_REORDER',
    'CLEARANCE',
    'DISCONTINUE',
    'SUPPLIER_RETURN'
  ]
};

// In-Memory Collection Review Queue Fallback
let memoryReviewItems = [
  {
    id: 'rev-001',
    designCode: 'NSK-EAR-001',
    designName: 'Kundan Pearl Drop Earrings',
    categoryName: 'Earrings',
    collectionType: 'monthly_trend',
    launchDate: '2026-09-20',
    reviewDueDate: '2026-10-20',
    intervalDays: 30,
    status: 'under_review',
    openingSellableUnits: 40,
    eligibleReceiptUnits: 20,
    netUnitsSold: 38,
    reorderPolicy: 'standard',
    decisionsHistory: []
  },
  {
    id: 'rev-002',
    designCode: 'NSK-RNG-002',
    designName: 'Polki Solitaire Ring',
    categoryName: 'Rings',
    collectionType: 'monthly_trend',
    launchDate: '2026-09-28',
    reviewDueDate: '2026-10-28',
    intervalDays: 30,
    status: 'active',
    openingSellableUnits: 50,
    eligibleReceiptUnits: 15,
    netUnitsSold: 42,
    reorderPolicy: 'standard',
    decisionsHistory: []
  },
  {
    id: 'rev-003',
    designCode: 'NSK-HAR-004',
    designName: 'Raw Silk & Pearl Headband',
    categoryName: 'Hair Accessories',
    collectionType: 'monthly_trend',
    launchDate: '2026-08-15',
    reviewDueDate: '2026-09-15',
    intervalDays: 30,
    status: 'clearance',
    openingSellableUnits: 80,
    eligibleReceiptUnits: 0,
    netUnitsSold: 28,
    reorderPolicy: 'blocked_clearance',
    decisionsHistory: [
      {
        decision: 'CLEARANCE',
        reason: 'Low sell-through (35%) after 30-day review period',
        actorId: 'usr-mgr-01',
        decidedAt: '2026-09-16T10:00:00.000Z'
      }
    ]
  },
  {
    id: 'rev-004',
    designCode: 'NSK-NOS-005',
    designName: 'Bridal Maharashtrian Nath',
    categoryName: 'Nose Rings & Pins',
    collectionType: 'monthly_trend',
    launchDate: '2026-09-10',
    reviewDueDate: '2026-10-10',
    intervalDays: 30,
    status: 'under_review',
    openingSellableUnits: 25,
    eligibleReceiptUnits: 10,
    netUnitsSold: 12,
    reorderPolicy: 'standard',
    decisionsHistory: []
  }
];

let memoryReviewTasks = [
  {
    id: 'task-rev-001',
    title: '30-Day Decision: NSK-EAR-001 Kundan Earrings',
    assignedTo: 'Kabir Mehta (Manager)',
    dueDate: '2026-10-20',
    priority: 'HIGH',
    linkedRecord: 'NSK-EAR-001',
    status: 'OPEN'
  },
  {
    id: 'task-rev-004',
    title: '30-Day Decision: NSK-NOS-005 Bridal Nath',
    assignedTo: 'Aadhya Sharma (Owner)',
    dueDate: '2026-10-10',
    priority: 'HIGH',
    linkedRecord: 'NSK-NOS-005',
    status: 'OPEN'
  }
];

/**
 * 1. Calculate Review Due Date (Launch Date + intervalDays)
 */
export function calculateReviewDueDate(launchDateStr, intervalDays = REVIEW_CONFIG.defaultIntervalDays) {
  if (!launchDateStr) throw new Error('launchDate is required');
  const d = new Date(launchDateStr);
  if (isNaN(d.getTime())) throw new Error('Invalid launchDate format');

  d.setDate(d.getDate() + intervalDays);
  return d.toISOString().slice(0, 10);
}

/**
 * 2. Check if Review is Due as of a specific date
 */
export function isReviewDue(reviewDueDateStr, asOfDate = new Date()) {
  if (!reviewDueDateStr) return false;
  const due = new Date(reviewDueDateStr);
  const now = typeof asOfDate === 'string' ? new Date(asOfDate) : asOfDate;
  // Due if asOfDate >= reviewDueDate (date portion)
  return now.toISOString().slice(0, 10) >= due.toISOString().slice(0, 10);
}

/**
 * 3. Period Sell-Through Rate Formula:
 * Sell-Through = Net Units Sold / (Opening Sellable Stock + Eligible Receipts in Period)
 */
export function calculateSellThroughRate(netUnitsSold, openingSellableStock, eligibleReceipts = 0) {
  const sold = Math.max(0, parseInt(netUnitsSold, 10) || 0);
  const opening = Math.max(0, parseInt(openingSellableStock, 10) || 0);
  const receipts = Math.max(0, parseInt(eligibleReceipts, 10) || 0);
  const totalAvailable = opening + receipts;

  if (totalAvailable === 0) {
    return {
      rateDecimal: 0,
      percentage: 0,
      formatted: 'N/A',
      soldUnits: sold,
      baseUnits: totalAvailable
    };
  }

  const rate = sold / totalAvailable;
  const pct = Math.min(100, Number((rate * 100).toFixed(1)));

  return {
    rateDecimal: Number(rate.toFixed(4)),
    percentage: pct,
    formatted: `${pct}%`,
    soldUnits: sold,
    baseUnits: totalAvailable
  };
}

/**
 * 4. Idempotent Review Queue Evaluator
 * Scans collection designs and flags items due for review without duplicating tasks
 */
export function evaluateReviewQueue(asOfDate = new Date()) {
  const asOfStr = typeof asOfDate === 'string' ? asOfDate : asOfDate.toISOString().slice(0, 10);
  let updatedCount = 0;
  let newTasksCount = 0;

  for (const item of memoryReviewItems) {
    const due = isReviewDue(item.reviewDueDate, asOfStr);

    if (due && item.status === 'active') {
      item.status = 'under_review';
      updatedCount++;

      // Idempotent task creation: only create if not already existing
      const existingTask = memoryReviewTasks.find(
        (t) => t.linkedRecord === item.designCode && t.status === 'OPEN'
      );

      if (!existingTask) {
        memoryReviewTasks.push({
          id: `task-rev-${Date.now()}-${item.designCode}`,
          title: `30-Day Decision: ${item.designCode} ${item.designName}`,
          assignedTo: 'Kabir Mehta (Manager)',
          dueDate: item.reviewDueDate,
          priority: 'HIGH',
          linkedRecord: item.designCode,
          status: 'OPEN'
        });
        newTasksCount++;
      }
    }
  }

  return {
    asOfDate: asOfStr,
    evaluatedItems: memoryReviewItems.length,
    statusTransitions: updatedCount,
    newTasksCreated: newTasksCount
  };
}

/**
 * 5. Get current Review Queue with live computed sell-through metrics
 */
export function getReviewQueue() {
  const today = new Date().toISOString().slice(0, 10);

  return memoryReviewItems.map((item) => {
    const launch = new Date(item.launchDate);
    const repDate = new Date(today);
    const diffDays = Math.max(0, Math.floor((repDate - launch) / (1000 * 60 * 60 * 24)));
    const sellThrough = calculateSellThroughRate(
      item.netUnitsSold,
      item.openingSellableUnits,
      item.eligibleReceiptUnits
    );

    return {
      ...item,
      daysSinceLaunch: diffDays,
      sellThroughRate: sellThrough.formatted,
      sellThroughPercentage: sellThrough.percentage,
      isDue: isReviewDue(item.reviewDueDate, today)
    };
  });
}

/**
 * 6. Record Review Decision (State Transition & Audit)
 */
export async function recordReviewDecision({
  designCode,
  decision,
  reason,
  nextReviewDate = null,
  actor = null
}) {
  if (!designCode) throw new Error('designCode is required');
  if (!decision || !REVIEW_CONFIG.validDecisions.includes(decision)) {
    throw new Error(`Invalid decision '${decision}'. Must be one of: ${REVIEW_CONFIG.validDecisions.join(', ')}`);
  }
  if (!reason || reason.trim().length < 5) {
    throw new Error('A valid reason (minimum 5 characters) is required to record a lifecycle decision');
  }

  // Authorization check: Only Manager or Owner can record review decisions
  if (actor) {
    const perm = checkPermission(actor, 'review:decision');
    if (!perm.allowed) {
      throw new Error(`Forbidden: ${perm.reason}`);
    }
  }

  const item = memoryReviewItems.find((i) => i.designCode === designCode);
  if (!item) {
    throw new Error(`Design '${designCode}' not found in review queue`);
  }

  const nowIso = new Date().toISOString();
  let nextStatus = item.status;
  let nextReorderPolicy = item.reorderPolicy;
  let calculatedNextDueDate = nextReviewDate;

  switch (decision) {
    case 'CONTINUE':
      nextStatus = 'active';
      nextReorderPolicy = 'standard';
      calculatedNextDueDate = calculateReviewDueDate(nowIso.slice(0, 10), 30);
      break;

    case 'PROMOTE_TO_PERMANENT':
      nextStatus = 'active';
      nextReorderPolicy = 'reorder_suggested';
      item.collectionType = 'permanent';
      calculatedNextDueDate = null; // No longer on 30-day trial review
      break;

    case 'STOP_REORDER':
      nextStatus = 'active';
      nextReorderPolicy = 'blocked_end_of_line';
      calculatedNextDueDate = null;
      break;

    case 'CLEARANCE':
      nextStatus = 'clearance';
      nextReorderPolicy = 'blocked_clearance';
      calculatedNextDueDate = null;
      break;

    case 'DISCONTINUE':
      nextStatus = 'discontinued';
      nextReorderPolicy = 'blocked_clearance';
      calculatedNextDueDate = null;
      break;

    case 'SUPPLIER_RETURN':
      nextStatus = 'clearance';
      nextReorderPolicy = 'blocked_clearance';
      calculatedNextDueDate = null;
      break;
  }

  item.status = nextStatus;
  item.reorderPolicy = nextReorderPolicy;
  if (calculatedNextDueDate) {
    item.reviewDueDate = calculatedNextDueDate;
  }

  const decisionRecord = {
    decision,
    reason,
    actorId: actor?.id || 'usr-mgr-01',
    actorRole: actor?.roleId || 'manager',
    decidedAt: nowIso,
    nextReviewDueDate: calculatedNextDueDate
  };

  item.decisionsHistory.unshift(decisionRecord);

  // Close linked open review tasks
  for (const t of memoryReviewTasks) {
    if (t.linkedRecord === designCode && t.status === 'OPEN') {
      t.status = 'RESOLVED';
      t.resolvedAt = nowIso;
      t.resolution = decision;
    }
  }

  // Write immutable audit log
  await logAuditEvent({
    actorId: actor?.id || 'usr-mgr-01',
    action: 'COLLECTION_REVIEW_DECISION',
    resourceType: 'PRODUCT_DESIGN',
    resourceId: designCode,
    metadata: {
      decision,
      reason,
      nextStatus,
      nextReorderPolicy,
      nextReviewDueDate: calculatedNextDueDate
    }
  });

  return {
    success: true,
    item,
    decisionRecord
  };
}

/**
 * 7. Get open review tasks
 */
export function getReviewTasks() {
  return memoryReviewTasks;
}
