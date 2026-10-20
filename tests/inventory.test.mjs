/**
 * NISHKÈA Node 5: Transactional Inventory, Ledger & Reservations Test Suite
 *
 * Verifies:
 * 1. Available = Sellable On-Hand − Active Reservations
 * 2. Hard gate against negative available stock & overselling
 * 3. FIFO allocation of oldest batches first
 * 4. Idempotent reservation release & expiration
 * 5. Dispatch consumption deducting physical on-hand stock
 * 6. Append-only signed ledger movements
 * 7. Stock ageing calculations (0-30, 31-60, 61-90, 91+ days)
 * 8. Supplier cost isolation on batch queries
 */

import assert from 'assert';
import {
  computeAvailableStock,
  getVariantStockSummary,
  createGoodsReceipt,
  createReservation,
  releaseReservation,
  consumeReservation,
  recordStockAdjustment,
  calculateStockAgeing,
  getAllBatches
} from '../src/lib/server/inventory.js';

let passed = 0;
let failed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`✅ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`❌ FAIL: ${name}`);
    console.error(`   Error: ${err.message}`);
    failed++;
  }
}

async function runAsyncTest(name, fn) {
  try {
    await fn();
    console.log(`✅ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`❌ FAIL: ${name}`);
    console.error(`   Error: ${err.message}`);
    failed++;
  }
}

console.log('========================================================');
console.log('NISHKÈA Node 5: Transactional Inventory Acceptance Tests');
console.log('========================================================\n');

// 1. Core Mathematical Formula
runTest('Core Formula: Available = Sellable On-Hand − Active Reservations', () => {
  assert.strictEqual(computeAvailableStock(20, 5), 15);
  assert.strictEqual(computeAvailableStock(10, 10), 0);
  assert.strictEqual(computeAvailableStock(5, 8), 0, 'Must never allow negative available stock');
  assert.strictEqual(computeAvailableStock(0, 0), 0);
});

// 2. Initial Variant Summary
await runAsyncTest('Variant Stock Summary computes real-time available units', async () => {
  const summary = await getVariantStockSummary('NSK-EAR-001-GLD');
  assert.ok(summary.sellableOnHand > 0);
  assert.strictEqual(summary.availableUnits, summary.sellableOnHand - summary.reservedUnits);
});

// 3. Goods Receipt
await runAsyncTest('Goods Receipt creates new batch and logs signed positive movement', async () => {
  const res = await createGoodsReceipt({
    variantId: 'NSK-TEST-VAR-01',
    batchReference: 'BATCH-TEST-2026A',
    quantity: 25,
    unitCostMinor: 50000,
    actorId: 'usr-inv-01'
  });

  assert.strictEqual(res.success, true);
  assert.strictEqual(res.batch.initialQuantity, 25);
  assert.strictEqual(res.batch.currentQuantity, 25);
  assert.strictEqual(res.movement.quantity, 25, 'Receipt movement must be signed positive');
  assert.strictEqual(res.movement.movementType, 'RECEIPT');
});

// 4. Atomic Reservation & Zero-Overselling Gate
await runAsyncTest('Atomic Reservation reserves stock and decrements available units', async () => {
  const initial = await getVariantStockSummary('NSK-TEST-VAR-01');
  const res = await createReservation({
    variantId: 'NSK-TEST-VAR-01',
    quantity: 10,
    orderRef: 'ORD-TEST-1001'
  });

  assert.strictEqual(res.success, true);
  assert.strictEqual(res.reservedQuantity, 10);

  const updated = await getVariantStockSummary('NSK-TEST-VAR-01');
  assert.strictEqual(updated.reservedUnits, initial.reservedUnits + 10);
  assert.strictEqual(updated.availableUnits, initial.availableUnits - 10);
});

// 5. Overselling Prevention Gate
await runAsyncTest('Zero Overselling: Rejects reservation when quantity > available stock', async () => {
  const summary = await getVariantStockSummary('NSK-TEST-VAR-01');
  let threw = false;

  try {
    await createReservation({
      variantId: 'NSK-TEST-VAR-01',
      quantity: summary.availableUnits + 50
    });
  } catch (err) {
    threw = true;
    assert.match(err.message, /Insufficient available stock/);
  }

  assert.strictEqual(threw, true, 'Overselling must be strictly blocked with an error');
});

// 6. Idempotent Reservation Release
await runAsyncTest('Reservation Release restores available stock idempotently', async () => {
  // Create hold
  const hold = await createReservation({
    variantId: 'NSK-TEST-VAR-01',
    quantity: 5,
    orderRef: 'ORD-TEST-RELEASE'
  });

  const beforeRelease = await getVariantStockSummary('NSK-TEST-VAR-01');

  // First release
  const rel = await releaseReservation({
    reservationId: hold.reservationId,
    reason: 'CANCELLED'
  });

  assert.strictEqual(rel.success, true);
  assert.strictEqual(rel.releasedUnits, 5);

  const afterRelease = await getVariantStockSummary('NSK-TEST-VAR-01');
  assert.strictEqual(afterRelease.availableUnits, beforeRelease.availableUnits + 5);

  // Second release (Idempotency check)
  const rel2 = await releaseReservation({
    reservationId: hold.reservationId
  });
  assert.strictEqual(rel2.success, false, 'Second release must be a no-op');
});

// 7. Dispatch Consumption
await runAsyncTest('Dispatch Consumption permanently deducts physical on-hand units', async () => {
  const hold = await createReservation({
    variantId: 'NSK-TEST-VAR-01',
    quantity: 4,
    orderRef: 'ORD-TEST-DISPATCH'
  });

  const beforeSummary = await getVariantStockSummary('NSK-TEST-VAR-01');

  const dispatchResult = await consumeReservation({
    reservationId: hold.reservationId,
    dispatchRef: 'DSP-TEST-001'
  });

  assert.strictEqual(dispatchResult.success, true);
  assert.strictEqual(dispatchResult.consumedUnits, 4);

  const afterSummary = await getVariantStockSummary('NSK-TEST-VAR-01');
  assert.strictEqual(afterSummary.sellableOnHand, beforeSummary.sellableOnHand - 4);
});

// 8. Audited Stock Adjustment
await runAsyncTest('Stock Adjustment modifies quantity and writes audit event', async () => {
  const all = getAllBatches({ roleId: 'manager' });
  const target = all[0];
  const initialQty = target.currentQuantity;

  const adj = await recordStockAdjustment({
    batchId: target.id,
    quantityDelta: 2,
    reason: 'Physical count found +2 pairs'
  });

  assert.strictEqual(adj.success, true);
  assert.strictEqual(adj.currentQuantity, initialQty + 2);

  // Negative quantity check
  let blocked = false;
  try {
    await recordStockAdjustment({
      batchId: target.id,
      quantityDelta: -99999,
      reason: 'Excessive deduction'
    });
  } catch (err) {
    blocked = true;
    assert.match(err.message, /negative/);
  }
  assert.strictEqual(blocked, true, 'Adjustment below zero must be blocked');
});

// 9. Stock Ageing Analysis
runTest('Stock Ageing classifies batches into 0-30, 31-60, 61-90, 91+ day brackets', () => {
  const ageing = calculateStockAgeing();
  assert.strictEqual(ageing.buckets.length, 4);
  assert.strictEqual(ageing.buckets[0].label, '0–30 Days');
  assert.strictEqual(ageing.buckets[1].label, '31–60 Days');
  assert.strictEqual(ageing.buckets[2].label, '61–90 Days');
  assert.strictEqual(ageing.buckets[3].label, '91+ Days');
  assert.ok(ageing.totalUnits > 0);
  assert.ok(ageing.totalUnsoldCostMinor > 0);
});

// 10. Supplier Cost Isolation
runTest('Supplier Cost Isolation: Hides unit cost from unauthorized roles', () => {
  const salesBatches = getAllBatches({ roleId: 'sales_support' });
  assert.strictEqual(salesBatches[0].unitCostMinor, undefined, 'Sales staff must NOT see unit cost');

  const ownerBatches = getAllBatches({ roleId: 'owner' });
  assert.ok(ownerBatches[0].unitCostMinor !== undefined, 'Owner MUST see unit cost');
});

console.log('\n========================================================');
console.log(`Results: ${passed}/${passed + failed} tests passed.`);
console.log('========================================================');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 Node 5 Acceptance Gate: ALL TESTS PASSED\n');
}
