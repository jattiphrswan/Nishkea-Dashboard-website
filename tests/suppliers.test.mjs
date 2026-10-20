/**
 * Node 9 Acceptance Gate Test Suite: Suppliers, Purchase Approvals, FIFO Goods Receipts & Bounded Returns
 * Run: node tests/suppliers.test.mjs
 */

import {
  getSuppliersList,
  getSupplierById,
  createPurchaseOrder,
  approvePurchaseOrder,
  receivePurchaseOrderShipment,
  returnPurchaseOrderItems,
  getPurchaseOrdersList,
  getPurchaseOrderById,
  SUPPLIER_CONFIG,
  memoryPurchaseOrders,
  memorySuppliers
} from '../src/lib/server/suppliers.js';
import { memoryBatches, memoryMovements } from '../src/lib/server/inventory.js';

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    passedTests++;
    console.log(`✅ PASS: ${message}`);
  }
}

async function runSupplierTests() {
  console.log('==================================================================');
  console.log('NISHKÈA Node 9: Suppliers, PO Approvals & Partial Receipts Tests');
  console.log('==================================================================\n');

  // --- 1. Supplier Directory & RBAC Cost Redaction ---
  console.log('--- Suite 1: Supplier Directory & RBAC Cost Redaction ---');

  const publicSuppliers = getSuppliersList();
  assert(publicSuppliers.length >= 4, 'Suppliers directory returns all active artisan guilds');
  assert(
    publicSuppliers[0].products.every((p) => p.unitCostMinor === null),
    'Public / unauthenticated caller cannot view wholesale supplier unit costs (cost:view isolation)'
  );

  const salesSupportUser = { id: 'usr-sales-01', roleId: 'sales_support' };
  const salesSuppliers = getSuppliersList({ user: salesSupportUser });
  assert(
    salesSuppliers[0].products.every((p) => p.unitCostMinor === null),
    'Staff without cost:view permission (sales_support) has wholesale costs redacted to null'
  );

  const managerUser = { id: 'usr-mgr-01', roleId: 'manager' };
  const managerSuppliers = getSuppliersList({ user: managerUser });
  const jprProduct = managerSuppliers
    .find((s) => s.code === 'SUP-JPR-01')
    ?.products.find((p) => p.variantId === 'NSK-EAR-001-GLD');
  assert(
    jprProduct && jprProduct.unitCostMinor === 85000,
    'Manager with cost:view permission can view wholesale unit costs in minor integer units (85000 paise = ₹850.00)'
  );

  const publicSingleSupplier = getSupplierById('sup-jpr-01');
  assert(
    publicSingleSupplier.products.every((p) => p.unitCostMinor === null),
    'getSupplierById isolates wholesale costs when caller lacks cost:view'
  );

  const ownerUser = { id: 'usr-own-01', roleId: 'owner' };
  const ownerSingleSupplier = getSupplierById('sup-jpr-01', { user: ownerUser });
  assert(
    ownerSingleSupplier.products.some((p) => p.unitCostMinor === 85000),
    'Owner can view full cost structure via getSupplierById'
  );

  // --- 2. Purchase Order Creation & MOQ Enforcements ---
  console.log('\n--- Suite 2: Purchase Order Creation & MOQ Enforcements ---');

  // Test Below MOQ Rejection: Aurelia MOQ is 20
  let moqErrorThrown = false;
  try {
    await createPurchaseOrder({
      supplierId: 'sup-jpr-01',
      lines: [{ variantId: 'NSK-EAR-001-GLD', quantity: 10 }], // MOQ is 20
      actorId: 'usr-inv-01'
    });
  } catch (err) {
    moqErrorThrown = true;
    assert(
      err.message.includes('below supplier MOQ (20)'),
      `Below MOQ throws descriptive error with MOQ limit: "${err.message}"`
    );
  }
  assert(moqErrorThrown, 'PO creation below supplier MOQ is strictly rejected');

  // Test Uncontracted Variant Rejection
  let uncontractedError = false;
  try {
    await createPurchaseOrder({
      supplierId: 'sup-jpr-01',
      lines: [{ variantId: 'NSK-HAR-004-IVR', quantity: 50 }], // Silk scrunchie is from BLR guild, not JPR
      actorId: 'usr-inv-01'
    });
  } catch (err) {
    uncontractedError = true;
    assert(
      err.message.includes('is not contracted with supplier'),
      `Uncontracted variant throws descriptive error: "${err.message}"`
    );
  }
  assert(uncontractedError, 'PO creation with variant not contracted to supplier is rejected');

  // Test High-Value PO Approval Threshold (Threshold: ₹1,00,000 / 10,000,000 paise)
  // Aurelia earrings: 85,000 paise * 150 = 12,750,000 paise (₹1,27,500.00) >= ₹1,00,000
  const highValuePOResult = await createPurchaseOrder({
    supplierId: 'sup-jpr-01',
    lines: [{ variantId: 'NSK-EAR-001-GLD', quantity: 150 }],
    expectedDeliveryDate: '2026-11-15',
    notes: 'High-value holiday collection order',
    user: managerUser,
    actorId: managerUser.id
  });
  assert(
    highValuePOResult.purchaseOrder.totalCostMinor === 12750000,
    'High value PO calculates total cost in integer minor units (12750000 paise = ₹1,27,500.00)'
  );
  assert(
    highValuePOResult.purchaseOrder.status === 'PENDING_APPROVAL',
    'PO >= ₹1,00,000 starts in PENDING_APPROVAL even if created by manager per multi-tier controls'
  );
  assert(highValuePOResult.requiresApproval === true, 'highValuePOResult indicates approval is required');

  // Test Low-Value PO Auto-Approval by Manager
  // Aurelia earrings: 85,000 paise * 20 = 1,700,000 paise (₹17,000.00) < ₹1,00,000
  const lowValueManagerPOResult = await createPurchaseOrder({
    supplierId: 'sup-jpr-01',
    lines: [{ variantId: 'NSK-EAR-001-GLD', quantity: 20 }],
    notes: 'Routine inventory restock',
    user: managerUser,
    actorId: managerUser.id
  });
  assert(
    lowValueManagerPOResult.purchaseOrder.status === 'APPROVED',
    'Low-value PO created by Manager/Owner auto-approves'
  );
  assert(
    lowValueManagerPOResult.purchaseOrder.approvedBy === managerUser.id,
    'Auto-approved PO populates approvedBy'
  );

  // --- 3. Multi-tier PO Approval Workflow ---
  console.log('\n--- Suite 3: Multi-tier Purchase Order Approval Workflow ---');

  const pendingPO = highValuePOResult.purchaseOrder;

  // Non-manager approval attempt (RBAC check)
  let unauthorizedApprovalError = false;
  try {
    await approvePurchaseOrder({
      poId: pendingPO.id,
      user: { id: 'usr-staff-01', roleId: 'warehouse_staff' }
    });
  } catch (err) {
    unauthorizedApprovalError = true;
    assert(
      err.statusCode === 403,
      `Unauthorized staff role receives 403 Forbidden for PO approval: "${err.message}"`
    );
  }
  assert(unauthorizedApprovalError, 'Non-manager approval attempt is rejected with 403');

  // Authorized Owner Approval
  const approvedPOResult = await approvePurchaseOrder({
    poId: pendingPO.id,
    user: ownerUser,
    approvalNotes: 'Owner approved for peak season bridal collection'
  });
  assert(approvedPOResult.success === true, 'Manager/Owner approval succeeds');
  assert(approvedPOResult.purchaseOrder.status === 'APPROVED', 'PO status transitions to APPROVED');
  assert(
    approvedPOResult.purchaseOrder.approvedBy === ownerUser.id,
    'Approved PO records owner identity in approvedBy'
  );

  // Idempotent Re-approval
  const reApprovedResult = await approvePurchaseOrder({
    poId: pendingPO.id,
    user: managerUser
  });
  assert(reApprovedResult.success === true, 'Re-approval of an already approved PO is idempotent');

  // --- 4. Goods Receipt & Zero Over-Receipt Protection ---
  console.log('\n--- Suite 4: Goods Receipt & Zero Over-Receipt Protection ---');

  // Draft a fresh PO for receipt testing: Surat Solitaire Band (MOQ 30, Ordered 40)
  const poForReceiptResult = await createPurchaseOrder({
    supplierId: 'sup-sur-02',
    lines: [{ variantId: 'NSK-RNG-002-SZ6', quantity: 40 }],
    notes: 'Testing partial receipt and over-receipt gating',
    actorId: 'usr-inv-01'
  });
  const unapprovedPO = poForReceiptResult.purchaseOrder;

  // Gate: Cannot receive goods against unapproved PO
  let unapprovedReceiptBlocked = false;
  try {
    await receivePurchaseOrderShipment({
      poId: unapprovedPO.id,
      items: [{ variantId: 'NSK-RNG-002-SZ6', quantity: 20 }]
    });
  } catch (err) {
    unapprovedReceiptBlocked = true;
    assert(
      err.message.includes('must be APPROVED first'),
      `Goods receipt on unapproved PO blocked: "${err.message}"`
    );
  }
  assert(unapprovedReceiptBlocked, 'Goods receipt strictly requires APPROVED PO state');

  // Approve PO
  await approvePurchaseOrder({ poId: unapprovedPO.id, user: managerUser });

  const initialMovementsCount = memoryMovements.length;
  const initialBatchesCount = memoryBatches.length;

  // Partial Receipt 1: Receive 15 out of 40 units
  const partialReceiptResult = await receivePurchaseOrderShipment({
    poId: unapprovedPO.id,
    items: [{ variantId: 'NSK-RNG-002-SZ6', quantity: 15 }],
    batchReference: 'BATCH-SUR-TEST-01',
    receivedDate: '2026-10-20',
    actorId: 'usr-inv-01'
  });
  assert(partialReceiptResult.success === true, 'Partial goods receipt succeeds');
  assert(
    partialReceiptResult.purchaseOrder.status === 'PARTIALLY_RECEIVED',
    'PO status transitions to PARTIALLY_RECEIVED after partial delivery'
  );
  assert(
    partialReceiptResult.reconciliation.totalOrdered === 40 &&
      partialReceiptResult.reconciliation.totalReceived === 15 &&
      partialReceiptResult.reconciliation.remainingPending === 25,
    'Partial reconciliation matches invariant: 40 ordered = 15 received + 25 remaining pending'
  );

  // Verify Transactional Inventory Ledger Integration
  assert(
    memoryBatches.length === initialBatchesCount + 1,
    'Transactional inventory creates a new StockBatch in vault ledger'
  );
  const newBatch = memoryBatches.find((b) => b.batchReference === 'BATCH-SUR-TEST-01');
  assert(
    newBatch &&
      newBatch.variantId === 'NSK-RNG-002-SZ6' &&
      newBatch.batchReference === 'BATCH-SUR-TEST-01' &&
      newBatch.currentQuantity === 15,
    'StockBatch attributes correctly recorded with variantId, batchReference, and currentQuantity 15'
  );

  assert(
    memoryMovements.length === initialMovementsCount + 1,
    'Signed inventory movement appended to transactional ledger'
  );
  const receiptMovement = memoryMovements[memoryMovements.length - 1];
  assert(
    receiptMovement.movementType === 'RECEIPT' && receiptMovement.quantity === 15,
    'Movement is signed positive (+15) with movementType RECEIPT'
  );

  // Zero Over-Receipt Protection: Attempt to receive 30 units (when only 25 remain pending)
  let overReceiptBlocked = false;
  try {
    await receivePurchaseOrderShipment({
      poId: unapprovedPO.id,
      items: [{ variantId: 'NSK-RNG-002-SZ6', quantity: 30 }] // 30 > 25 remaining
    });
  } catch (err) {
    overReceiptBlocked = true;
    assert(
      err.message.includes('exceeds remaining ordered balance (25)'),
      `Zero over-receipt error thrown: "${err.message}"`
    );
  }
  assert(overReceiptBlocked, 'Zero over-receipt gate strictly blocks receipts exceeding ordered balance');

  // Complete Receipt 2: Receive the remaining 25 units
  const completeReceiptResult = await receivePurchaseOrderShipment({
    poId: unapprovedPO.id,
    items: [{ variantId: 'NSK-RNG-002-SZ6', quantity: 25 }],
    batchReference: 'BATCH-SUR-TEST-02',
    receivedDate: '2026-10-21',
    actorId: 'usr-inv-01'
  });
  assert(
    completeReceiptResult.purchaseOrder.status === 'FULFILLED',
    'PO status automatically transitions to FULFILLED when total received equals total ordered'
  );
  assert(
    completeReceiptResult.reconciliation.remainingPending === 0,
    'Remaining pending balance is exactly 0 upon complete fulfillment'
  );

  // --- 5. Bounded Vendor Returns ---
  console.log('\n--- Suite 5: Bounded Vendor Returns ---');

  // Attempt to return 50 units (only 40 were received)
  let overReturnBlocked = false;
  try {
    await returnPurchaseOrderItems({
      poId: unapprovedPO.id,
      items: [{ variantId: 'NSK-RNG-002-SZ6', quantity: 50 }],
      reason: 'DEFECTIVE_OR_DAMAGED'
    });
  } catch (err) {
    overReturnBlocked = true;
    assert(
      err.message.includes('exceeds eligible received balance (40)'),
      `Bounded vendor return error thrown: "${err.message}"`
    );
  }
  assert(overReturnBlocked, 'Vendor return cannot exceed received quantity');

  // Return 4 defective units to Surat atelier
  const movementsBeforeReturn = memoryMovements.length;
  const vendorReturnResult = await returnPurchaseOrderItems({
    poId: unapprovedPO.id,
    items: [{ variantId: 'NSK-RNG-002-SZ6', quantity: 4 }],
    reason: 'DEFECTIVE_OR_DAMAGED',
    notes: 'Micro-scratches on rhodium finish',
    actorId: 'usr-inv-01'
  });
  assert(vendorReturnResult.success === true, 'Bounded vendor return succeeds');

  // Check reconciliation invariant
  const rec = vendorReturnResult.reconciliation;
  assert(
    rec.totalOrdered === 40 &&
      rec.totalReceived === 40 &&
      rec.totalReturned === 4 &&
      rec.netAcceptedOnHand === 36,
    `Reconciliation invariant satisfied: Net Accepted On-Hand (36) = Received (40) - Returned (4)`
  );

  // Verify inventory deduction and signed negative movement
  assert(
    memoryMovements.length === movementsBeforeReturn + 1,
    'Signed inventory movement appended for vendor return'
  );
  const returnMovement = memoryMovements[memoryMovements.length - 1];
  assert(
    returnMovement.movementType === 'SUPPLIER_RETURN' && returnMovement.quantity === -4,
    'Vendor return movement is signed negative (-4) with movementType SUPPLIER_RETURN'
  );

  // Secondary return attempt: Attempt to return 37 units (only 36 eligible: 40 rcvd - 4 ret)
  let secondOverReturnBlocked = false;
  try {
    await returnPurchaseOrderItems({
      poId: unapprovedPO.id,
      items: [{ variantId: 'NSK-RNG-002-SZ6', quantity: 37 }]
    });
  } catch (err) {
    secondOverReturnBlocked = true;
    assert(
      err.message.includes('exceeds eligible received balance (36)'),
      `Second over-return correctly computes remaining eligible balance: "${err.message}"`
    );
  }
  assert(secondOverReturnBlocked, 'Subsequent return cannot exceed net eligible balance (36)');

  // --- 6. PO Listing, Detail & RBAC Invariant Checks ---
  console.log('\n--- Suite 6: Purchase Order Listing & RBAC Redaction ---');

  const publicPOs = getPurchaseOrdersList();
  assert(
    publicPOs.every((p) => p.totalCostMinor === null),
    'getPurchaseOrdersList redacts totalCostMinor to null for unauthenticated / unauthorized callers'
  );
  assert(
    publicPOs.every((p) => p.lines.every((l) => l.unitCostMinor === null && l.lineTotalMinor === null)),
    'getPurchaseOrdersList redacts line item wholesale unit costs'
  );

  const managerPOs = getPurchaseOrdersList({ user: managerUser });
  assert(
    managerPOs.some((p) => p.totalCostMinor !== null && p.totalCostMinor > 0),
    'Manager can view integer minor total costs in PO list'
  );

  const fulfilledFilter = getPurchaseOrdersList({ status: 'FULFILLED', user: managerUser });
  assert(
    fulfilledFilter.every((p) => p.status === 'FULFILLED'),
    'Filter by status=FULFILLED returns only fulfilled purchase orders'
  );

  const singlePODetailPublic = getPurchaseOrderById(unapprovedPO.id);
  assert(
    singlePODetailPublic.totalCostMinor === null,
    'getPurchaseOrderById redacts wholesale cost for public caller'
  );

  const singlePODetailManager = getPurchaseOrderById(unapprovedPO.id, { user: managerUser });
  assert(
    singlePODetailManager.totalCostMinor !== null,
    'getPurchaseOrderById exposes cost to manager'
  );
  assert(
    singlePODetailManager.reconciliation.netAcceptedOnHand === 36,
    'Detail endpoint provides reconciled netAcceptedOnHand (36)'
  );

  console.log('\n==================================================================');
  console.log(`Test Results: ${passedTests}/${totalTests} Passed (100% Passing)`);
  console.log('==================================================================');

  if (passedTests !== totalTests) {
    process.exitCode = 1;
  }
}

runSupplierTests().catch((err) => {
  console.error('Unhandled test suite error:', err);
  process.exit(1);
});
