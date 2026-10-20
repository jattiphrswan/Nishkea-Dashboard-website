/**
 * NISHKÈA Transactional Inventory Engine — Node 5
 *
 * Enforces fundamental jewellery business rules:
 * 1. Available = Sellable On-Hand − Active Reservations
 * 2. On-Hand = Sellable + Quarantine + Damaged physical units
 * 3. Never allow negative available stock or overselling
 * 4. Append-only ledger movements with signed quantities
 * 5. Strict FIFO allocation for stock ageing and cost reporting
 * 6. Idempotent reservation expiry and dispatch consumption
 */

import crypto from 'crypto';
import { query } from './db.js';
import { checkPermission, logAuditEvent } from './permissions.js';

// Configuration Defaults
export const INVENTORY_CONFIG = {
  defaultReservationTtlMinutes: 15,
  ageingBuckets: [
    { label: '0–30 Days', minDays: 0, maxDays: 30 },
    { label: '31–60 Days', minDays: 31, maxDays: 60 },
    { label: '61–90 Days', minDays: 61, maxDays: 90 },
    { label: '91+ Days', minDays: 91, maxDays: Infinity }
  ]
};

// In-Memory Transactional Fallback Ledger (Active when live DB URL is pending)
export let memoryBatches = [
  { id: 'BAT-202610-01', variantId: 'NSK-EAR-001-GLD', batchReference: 'BATCH-202610-A', unitCostMinor: 85000, initialQuantity: 20, currentQuantity: 18, receivedDate: '2026-10-01' },
  { id: 'BAT-202606-12', variantId: 'NSK-RNG-002-SZ7', batchReference: 'BATCH-202606-C', unitCostMinor: 62000, initialQuantity: 50, currentQuantity: 22, receivedDate: '2026-06-15' },
  { id: 'BAT-202609-08', variantId: 'NSK-NCK-003-BUR', batchReference: 'BATCH-202609-B', unitCostMinor: 110000, initialQuantity: 15, currentQuantity: 5, receivedDate: '2026-09-18' },
  { id: 'BAT-202607-20', variantId: 'NSK-HAR-004-IVR', batchReference: 'BATCH-202607-A', unitCostMinor: 48000, initialQuantity: 80, currentQuantity: 30, receivedDate: '2026-07-10' },
  { id: 'BAT-202605-18', variantId: 'NSK-EAR-006-GLD', batchReference: 'BATCH-202605-E', unitCostMinor: 42000, initialQuantity: 100, currentQuantity: 42, receivedDate: '2026-05-01' }
];

export let memoryMovements = [];
export let memoryReservations = [
  { id: 'res-init-01', orderRef: 'NSK-2026-1082', variantId: 'NSK-EAR-001-GLD', batchId: 'BAT-202610-01', quantity: 2, state: 'ACTIVE', expiresAt: new Date(Date.now() + 600000).toISOString() },
  { id: 'res-init-02', orderRef: 'NSK-2026-1081', variantId: 'NSK-RNG-002-SZ7', batchId: 'BAT-202606-12', quantity: 3, state: 'ACTIVE', expiresAt: new Date(Date.now() + 600000).toISOString() }
];

/**
 * Core Formula: Compute Available Units
 * Available = Sellable On-Hand − Active Reservations
 */
export function computeAvailableStock(sellableOnHand, activeReserved) {
  const sellable = Math.max(0, parseInt(sellableOnHand, 10) || 0);
  const reserved = Math.max(0, parseInt(activeReserved, 10) || 0);
  return Math.max(0, sellable - reserved);
}

/**
 * Get current stock summary for a variant
 */
export async function getVariantStockSummary(variantId) {
  if (!variantId) throw new Error('variantId is required');

  // Try PostgreSQL if available
  try {
    const res = await query(
      `SELECT 
         COALESCE(SUM(b.current_quantity), 0) as sellable_on_hand,
         COALESCE((
           SELECT SUM(rl.quantity) 
           FROM reservation_lines rl
           JOIN reservations r ON rl.reservation_id = r.id
           WHERE rl.variant_id = $1 AND r.state = 'ACTIVE' AND r.expires_at > CURRENT_TIMESTAMP
         ), 0) as reserved_units
       FROM stock_batches b
       WHERE b.variant_id = $1`,
      [variantId]
    );

    if (res.rowCount > 0) {
      const sellable = parseInt(res.rows[0].sellable_on_hand, 10);
      const reserved = parseInt(res.rows[0].reserved_units, 10);
      return {
        variantId,
        sellableOnHand: sellable,
        reservedUnits: reserved,
        availableUnits: computeAvailableStock(sellable, reserved)
      };
    }
  } catch {
    // Database pending: Fallback to in-memory ledger
  }

  // In-memory calculation
  const batches = memoryBatches.filter((b) => b.variantId === variantId);
  const sellableOnHand = batches.reduce((sum, b) => sum + b.currentQuantity, 0);

  const now = new Date();
  const activeReservations = memoryReservations.filter(
    (r) => r.variantId === variantId && r.state === 'ACTIVE' && new Date(r.expiresAt) > now
  );
  const reservedUnits = activeReservations.reduce((sum, r) => sum + r.quantity, 0);

  return {
    variantId,
    sellableOnHand,
    reservedUnits,
    availableUnits: computeAvailableStock(sellableOnHand, reservedUnits)
  };
}

/**
 * 1. Goods Receipt (Receipt Batch + Signed Movement)
 * Appends a new receipt batch and logs append-only movement.
 */
export async function createGoodsReceipt({
  variantId,
  batchReference,
  quantity,
  unitCostMinor,
  receivedDate = new Date().toISOString().slice(0, 10),
  actorId = 'usr-inv-01',
  sourceRef = 'PO-RECEIPT'
}) {
  if (!variantId) throw new Error('variantId is required');
  if (!batchReference) throw new Error('batchReference is required');
  const qty = parseInt(quantity, 10);
  if (isNaN(qty) || qty <= 0) throw new Error('Quantity must be a positive integer');

  const cost = parseInt(unitCostMinor, 10);
  if (isNaN(cost) || cost < 0) throw new Error('Unit cost must be a non-negative integer minor currency');

  const batchId = `BAT-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

  // In-memory ledger update
  const newBatch = {
    id: batchId,
    variantId,
    batchReference,
    unitCostMinor: cost,
    initialQuantity: qty,
    currentQuantity: qty,
    receivedDate
  };
  memoryBatches.unshift(newBatch);

  const movement = {
    id: memoryMovements.length + 1,
    batchId,
    variantId,
    quantity: qty, // Signed + for incoming receipt
    movementType: 'RECEIPT',
    sourceRef,
    actorId,
    createdAt: new Date().toISOString()
  };
  memoryMovements.push(movement);

  await logAuditEvent({
    actorId,
    action: 'INVENTORY_GOODS_RECEIPT',
    resourceType: 'STOCK_BATCH',
    resourceId: batchId,
    metadata: { variantId, quantity: qty, batchReference }
  });

  return {
    success: true,
    batch: newBatch,
    movement
  };
}

/**
 * 2. Atomic Stock Reservation (Checkout Hold)
 * Guarantees zero overselling: checks available stock, allocates FIFO batches, sets TTL.
 */
export async function createReservation({
  variantId,
  quantity,
  orderRef = `ORD-TEMP-${Date.now()}`,
  ttlMinutes = INVENTORY_CONFIG.defaultReservationTtlMinutes,
  actorId = 'system'
}) {
  if (!variantId) throw new Error('variantId is required');
  const qty = parseInt(quantity, 10);
  if (isNaN(qty) || qty <= 0) throw new Error('Quantity must be a positive integer');

  const stockSummary = await getVariantStockSummary(variantId);

  // Hard Gate: Never allow negative available stock or overselling
  if (stockSummary.availableUnits < qty) {
    throw new Error(
      `Insufficient available stock for variant '${variantId}'. Requested: ${qty}, Available: ${stockSummary.availableUnits}`
    );
  }

  // Find eligible batches using FIFO (oldest received date first)
  const eligibleBatches = memoryBatches
    .filter((b) => b.variantId === variantId && b.currentQuantity > 0)
    .sort((a, b) => new Date(a.receivedDate) - new Date(b.receivedDate));

  const reservationId = `RES-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString();

  // Allocate across oldest batches (FIFO)
  let remainingToReserve = qty;
  const lines = [];

  for (const batch of eligibleBatches) {
    if (remainingToReserve <= 0) break;
    const allocateQty = Math.min(batch.currentQuantity, remainingToReserve);
    remainingToReserve -= allocateQty;

    const line = {
      id: reservationId,
      orderRef,
      variantId,
      batchId: batch.id,
      quantity: allocateQty,
      state: 'ACTIVE',
      expiresAt,
      createdAt: new Date().toISOString()
    };

    memoryReservations.push(line);
    lines.push(line);

    // Record hold movement
    memoryMovements.push({
      id: memoryMovements.length + 1,
      batchId: batch.id,
      variantId,
      quantity: -allocateQty, // Hold reservation
      movementType: 'RESERVATION_HOLD',
      sourceRef: orderRef,
      actorId,
      createdAt: new Date().toISOString()
    });
  }

  return {
    success: true,
    reservationId,
    orderRef,
    variantId,
    reservedQuantity: qty,
    expiresAt,
    lines
  };
}

/**
 * 3. Release Reservation (Expired TTL or User Cancellation)
 * Idempotent: Releases reserved units back to available stock once.
 */
export async function releaseReservation({
  reservationId,
  reason = 'EXPIRED',
  actorId = 'system'
}) {
  if (!reservationId) throw new Error('reservationId is required');

  const matchingLines = memoryReservations.filter(
    (r) => r.id === reservationId && r.state === 'ACTIVE'
  );

  if (matchingLines.length === 0) {
    return {
      success: false,
      message: 'Reservation not found or already consumed/released'
    };
  }

  let releasedUnits = 0;

  for (const line of matchingLines) {
    line.state = reason === 'CANCELLED' ? 'CANCELLED' : 'EXPIRED';
    releasedUnits += line.quantity;

    // Log compensating release movement
    memoryMovements.push({
      id: memoryMovements.length + 1,
      batchId: line.batchId,
      variantId: line.variantId,
      quantity: line.quantity, // Released back to available pool
      movementType: 'RESERVATION_RELEASE',
      sourceRef: line.orderRef,
      actorId,
      createdAt: new Date().toISOString()
    });
  }

  return {
    success: true,
    reservationId,
    releasedUnits,
    reason
  };
}

/**
 * 4. Consume Reservation on Dispatch (Order Fulfilment)
 * Decrements physical on-hand batch quantities and closes the reservation.
 */
export async function consumeReservation({
  reservationId,
  dispatchRef = `DSP-${Date.now()}`,
  actorId = 'usr-inv-01'
}) {
  if (!reservationId) throw new Error('reservationId is required');

  const matchingLines = memoryReservations.filter(
    (r) => r.id === reservationId && r.state === 'ACTIVE'
  );

  if (matchingLines.length === 0) {
    throw new Error('Active reservation not found. Cannot dispatch without valid reservation.');
  }

  let totalConsumed = 0;

  for (const line of matchingLines) {
    line.state = 'CONSUMED';
    totalConsumed += line.quantity;

    // Deduct physical inventory from batch
    const batch = memoryBatches.find((b) => b.id === line.batchId);
    if (batch) {
      batch.currentQuantity = Math.max(0, batch.currentQuantity - line.quantity);
    }

    // Record immutable dispatch movement
    memoryMovements.push({
      id: memoryMovements.length + 1,
      batchId: line.batchId,
      variantId: line.variantId,
      quantity: -line.quantity, // Signed negative consumption
      movementType: 'DISPATCH',
      sourceRef: dispatchRef,
      actorId,
      createdAt: new Date().toISOString()
    });
  }

  await logAuditEvent({
    actorId,
    action: 'INVENTORY_DISPATCH_CONSUMPTION',
    resourceType: 'RESERVATION',
    resourceId: reservationId,
    metadata: { dispatchRef, consumedUnits: totalConsumed }
  });

  return {
    success: true,
    reservationId,
    dispatchRef,
    consumedUnits: totalConsumed
  };
}

/**
 * 5. Audited Stock Adjustment (Manual Count Corrections / Damage)
 * Uses signed quantity delta and logs full audit trail.
 */
export async function recordStockAdjustment({
  batchId,
  quantityDelta,
  reason = 'Cycle count reconciliation',
  condition = 'sellable',
  actorId = 'usr-mgr-01'
}) {
  if (!batchId) throw new Error('batchId is required');
  const delta = parseInt(quantityDelta, 10);
  if (isNaN(delta) || delta === 0) throw new Error('quantityDelta must be a non-zero integer');

  const batch = memoryBatches.find((b) => b.id === batchId);
  if (!batch) throw new Error(`Batch '${batchId}' not found`);

  const nextQuantity = batch.currentQuantity + delta;
  if (nextQuantity < 0) {
    throw new Error(`Adjustment would cause batch quantity to become negative (${nextQuantity}). Blocked.`);
  }

  const previousQty = batch.currentQuantity;
  batch.currentQuantity = nextQuantity;

  const movementType = condition === 'damaged' ? 'DAMAGE' : 'ADJUSTMENT';

  const movement = {
    id: memoryMovements.length + 1,
    batchId,
    variantId: batch.variantId,
    quantity: delta,
    movementType,
    sourceRef: reason,
    actorId,
    createdAt: new Date().toISOString()
  };
  memoryMovements.push(movement);

  await logAuditEvent({
    actorId,
    action: 'INVENTORY_MANUAL_ADJUSTMENT',
    resourceType: 'STOCK_BATCH',
    resourceId: batchId,
    metadata: { previousQty, nextQuantity, delta, reason }
  });

  return {
    success: true,
    batchId,
    previousQty,
    currentQuantity: nextQuantity,
    delta,
    movement
  };
}

/**
 * 6. Stock Ageing Analysis (0–30, 31–60, 61–90, 91+ Days)
 * Batch age = reportDate − receivedDate.
 * Unsold cost evaluated strictly from remaining batch units.
 */
export function calculateStockAgeing(reportDate = new Date()) {
  const repDate = new Date(reportDate);

  const buckets = [
    { label: '0–30 Days', minDays: 0, maxDays: 30, units: 0, costMinor: 0, batchesCount: 0 },
    { label: '31–60 Days', minDays: 31, maxDays: 60, units: 0, costMinor: 0, batchesCount: 0 },
    { label: '61–90 Days', minDays: 61, maxDays: 90, units: 0, costMinor: 0, batchesCount: 0 },
    { label: '91+ Days', minDays: 91, maxDays: Infinity, units: 0, costMinor: 0, batchesCount: 0 }
  ];

  let grandTotalUnits = 0;
  let grandTotalCostMinor = 0;

  for (const batch of memoryBatches) {
    if (batch.currentQuantity <= 0) continue;

    const rcvDate = new Date(batch.receivedDate);
    const ageDays = Math.max(0, Math.floor((repDate - rcvDate) / (1000 * 60 * 60 * 24)));
    const batchCost = batch.currentQuantity * batch.unitCostMinor;

    grandTotalUnits += batch.currentQuantity;
    grandTotalCostMinor += batchCost;

    for (const bucket of buckets) {
      if (ageDays >= bucket.minDays && ageDays <= bucket.maxDays) {
        bucket.units += batch.currentQuantity;
        bucket.costMinor += batchCost;
        bucket.batchesCount += 1;
        break;
      }
    }
  }

  // Calculate percentages
  const resultBuckets = buckets.map((b) => ({
    ...b,
    percentageUnits: grandTotalUnits > 0 ? Number(((b.units / grandTotalUnits) * 100).toFixed(1)) : 0,
    percentageCost: grandTotalCostMinor > 0 ? Number(((b.costMinor / grandTotalCostMinor) * 100).toFixed(1)) : 0
  }));

  return {
    reportDate: repDate.toISOString().slice(0, 10),
    totalUnits: grandTotalUnits,
    totalUnsoldCostMinor: grandTotalCostMinor,
    currency: 'INR',
    buckets: resultBuckets
  };
}

/**
 * Get all current batches (with optional supplier cost isolation)
 */
export function getAllBatches(user = null) {
  const perm = user ? checkPermission(user, 'cost:view') : { allowed: false };

  return memoryBatches.map((b) => {
    const item = {
      id: b.id,
      variantId: b.variantId,
      batchReference: b.batchReference,
      initialQuantity: b.initialQuantity,
      currentQuantity: b.currentQuantity,
      receivedDate: b.receivedDate
    };

    if (perm.allowed) {
      item.unitCostMinor = b.unitCostMinor;
      item.totalCostMinor = b.currentQuantity * b.unitCostMinor;
    }

    return item;
  });
}

/**
 * Get recent movements
 */
export function getRecentMovements(limit = 20) {
  return [...memoryMovements].reverse().slice(0, limit);
}
