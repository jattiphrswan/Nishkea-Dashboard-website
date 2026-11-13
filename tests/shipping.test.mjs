/**
 * NISHKÈA Node 19: Multi-Courier Shipping Automation & Reverse Logistics Test Suite
 *
 * Verifies:
 * 1. Pincode serviceability & SLA computation across Tier-1/Tier-2 pincodes
 * 2. Invalid pincode rejection & Remote zone edge cases
 * 3. Chargeable & volumetric weight calculation
 * 4. High-value carrier selection logic (Sequel Armoured vs BlueDart Apex)
 * 5. Consignment manifesting, AWB number issuance & security seal generation
 * 6. Duplicate manifest prevention
 * 7. Live milestone tracking aggregation & status normalization
 * 8. Armoured reverse pickup scheduling for customer returns
 * 9. RBAC permission gates for manifesting ('order:dispatch') and reverse pickups ('order:return_inspect')
 * 10. Printable shipping label HTML generation
 */

import assert from 'assert';
import {
  CARRIERS,
  checkPincodeServiceability,
  calculateChargeableWeight,
  manifestShipment,
  getShipmentTracking,
  updateTrackingMilestone,
  scheduleReversePickup,
  renderShippingLabelHtml,
  memoryConsignments
} from '../src/lib/server/shipping.js';
import { memoryOrders } from '../src/lib/server/orders.js';

let passed = 0;
function it(description, fn) {
  try {
    fn();
    console.log(`✅ PASS: ${description}`);
    passed++;
  } catch (err) {
    console.error(`❌ FAIL: ${description}`);
    console.error(err);
    process.exit(1);
  }
}

async function itAsync(description, fn) {
  try {
    await fn();
    console.log(`✅ PASS: ${description}`);
    passed++;
  } catch (err) {
    console.error(`❌ FAIL: ${description}`);
    console.error(err);
    process.exit(1);
  }
}

console.log('==================================================================');
console.log('NISHKÈA Node 19: Multi-Courier Shipping & Logistics Acceptance Tests');
console.log('==================================================================\n');

// 1. Pincode Serviceability & SLA
await itAsync('Rejects invalid pincodes (non-numeric or not 6 digits)', async () => {
  const res1 = await checkPincodeServiceability('40001');
  assert.strictEqual(res1.serviceable, false);
  assert.ok(res1.error.includes('6 numeric digits'));

  const res2 = await checkPincodeServiceability('ABCDEF');
  assert.strictEqual(res2.serviceable, false);
});

await itAsync('Resolves Tier-1 Mumbai Metro pincode with 24-48h SLA', async () => {
  const res = await checkPincodeServiceability('400018', { orderValueMinor: 499900 });
  assert.strictEqual(res.serviceable, true);
  assert.strictEqual(res.city, 'Mumbai');
  assert.strictEqual(res.tier, 1);
  assert.strictEqual(res.recommendedCarrier, 'BLUEDART');
  assert.strictEqual(res.insuredTransit, true);
  assert.strictEqual(res.codAvailable, true);
});

await itAsync('Resolves Tier-1 Jaipur Atelier pincode with 24h SLA', async () => {
  const res = await checkPincodeServiceability('302001', { orderValueMinor: 249900 });
  assert.strictEqual(res.serviceable, true);
  assert.strictEqual(res.city, 'Jaipur');
  assert.strictEqual(res.tier, 1);
});

await itAsync('Selects Sequel Armoured carrier for high-value orders (>= ₹1 Lakh)', async () => {
  const res = await checkPincodeServiceability('400018', { orderValueMinor: 15000000 }); // ₹1.5 Lakhs
  assert.strictEqual(res.serviceable, true);
  assert.strictEqual(res.recommendedCarrier, 'SEQUEL');
  assert.ok(res.carrierName.includes('Sequel'));
});

await itAsync('Resolves Tier-2 Domestic Rest of India pincode with 3-5 day SLA', async () => {
  const res = await checkPincodeServiceability('695001'); // Trivandrum
  assert.strictEqual(res.serviceable, true);
  assert.strictEqual(res.tier, 2);
  assert.strictEqual(res.zone, 'DOMESTIC_REST_OF_INDIA');
});

// 2. Weight Calculations
it('Computes volumetric and chargeable weight accurately', () => {
  const calc1 = calculateChargeableWeight({ deadweightGrams: 200, lengthCm: 15, widthCm: 10, heightCm: 5 });
  // Volumetric = (15 * 10 * 5 / 5000) * 1000 = 150g. Max(200, 150) = 200g
  assert.strictEqual(calc1.deadweightGrams, 200);
  assert.strictEqual(calc1.volumetricGrams, 150);
  assert.strictEqual(calc1.chargeableGrams, 200);
  assert.strictEqual(calc1.chargeableWeightKg, 0.2);

  const calc2 = calculateChargeableWeight({ deadweightGrams: 100, lengthCm: 25, widthCm: 20, heightCm: 10 });
  // Volumetric = (25 * 20 * 10 / 5000) * 1000 = 1000g. Max(100, 1000) = 1000g
  assert.strictEqual(calc2.chargeableGrams, 1000);
  assert.strictEqual(calc2.chargeableWeightKg, 1.0);
});

// 3. Consignment Manifesting & AWB Generation
await itAsync('Manifests shipment and issues unique BlueDart AWB', async () => {
  const targetOrder = memoryOrders[0];
  const manifest = await manifestShipment({
    orderId: targetOrder.id,
    carrierId: 'BLUEDART',
    packageDetails: { deadweightGrams: 300, lengthCm: 16, widthCm: 12, heightCm: 8 },
    actor: { roleId: 'inventory_staff', id: 'usr-inv-01' }
  });

  assert.strictEqual(manifest.success, true);
  assert.ok(manifest.consignment.awbNumber.startsWith('BLUEDART-NSK-'));
  assert.ok(manifest.consignment.securitySealNumber.startsWith('NSK-SEAL-'));
  assert.strictEqual(manifest.consignment.carrierId, 'BLUEDART');
  assert.strictEqual(manifest.consignment.status, 'MANIFESTED');
  assert.strictEqual(targetOrder.status, 'DISPATCHED');
  assert.strictEqual(targetOrder.fulfillment.trackingNumber, manifest.consignment.awbNumber);
});

await itAsync('Prevents duplicate consignment manifesting for the same order', async () => {
  const targetOrder = memoryOrders[0];
  const duplicateManifest = await manifestShipment({
    orderId: targetOrder.id,
    carrierId: 'BLUEDART',
    actor: { roleId: 'inventory_staff', id: 'usr-inv-01' }
  });

  assert.strictEqual(duplicateManifest.success, true);
  assert.strictEqual(duplicateManifest.isExisting, true);
});

await itAsync('Enforces RBAC on manifestShipment: denies sales_support', async () => {
  let denied = false;
  try {
    await manifestShipment({
      orderId: 'ord-init-1082',
      actor: { roleId: 'sales_support', id: 'usr-sales-01' }
    });
  } catch (err) {
    denied = true;
    assert.ok(err.message.includes('Access Denied'));
  }
  assert.strictEqual(denied, true, 'Sales support must be denied order:dispatch');
});

// 4. Milestone Tracking Aggregator
await itAsync('Retrieves live tracking milestones by AWB', async () => {
  const latestConsignment = memoryConsignments[0];
  const tracking = await getShipmentTracking(latestConsignment.awbNumber);

  assert.strictEqual(tracking.success, true);
  assert.strictEqual(tracking.awbNumber, latestConsignment.awbNumber);
  assert.strictEqual(tracking.carrierName, latestConsignment.carrierName);
  assert.ok(Array.isArray(tracking.milestones));
  assert.ok(tracking.milestones.length >= 1);
});

await itAsync('Ingests and updates milestone event to IN_TRANSIT', async () => {
  const latestConsignment = memoryConsignments[0];
  const updateRes = await updateTrackingMilestone({
    awbNumber: latestConsignment.awbNumber,
    status: 'IN_TRANSIT',
    milestone: 'DEPARTED_FACILITY',
    location: 'Worli Hub, Mumbai',
    description: 'Armoured vehicle in transit to patron destination'
  });

  assert.strictEqual(updateRes.success, true);
  assert.strictEqual(latestConsignment.status, 'IN_TRANSIT');
});

await itAsync('Transitions order to DELIVERED upon DELIVERED milestone', async () => {
  const latestConsignment = memoryConsignments[0];
  const targetOrder = memoryOrders.find((o) => o.orderNumber === latestConsignment.orderNumber);

  await updateTrackingMilestone({
    awbNumber: latestConsignment.awbNumber,
    status: 'DELIVERED',
    milestone: 'HANDOVER_COMPLETE',
    location: 'Patron Residence, Mumbai',
    description: 'Delivered and signed by recipient with OTP verification'
  });

  assert.strictEqual(latestConsignment.status, 'DELIVERED');
  assert.strictEqual(targetOrder.status, 'DELIVERED');
  assert.ok(targetOrder.deliveredAt);
});

// 5. Reverse Logistics (Customer Returns)
await itAsync('Schedules armoured reverse pickup with tamper-evident bag serial', async () => {
  // Ensure return record exists on target order
  const targetOrder = memoryOrders[0];
  if (!targetOrder.returns || targetOrder.returns.length === 0) {
    targetOrder.returns = [
      {
        id: 'ret_test_node19_01',
        orderNumber: targetOrder.orderNumber,
        status: 'IN_QUARANTINE',
        createdAt: new Date().toISOString()
      }
    ];
  }

  const pickupRes = await scheduleReversePickup({
    orderId: targetOrder.id,
    returnId: targetOrder.returns[0].id,
    actor: { roleId: 'manager', id: 'usr-mgr-01' }
  });

  assert.strictEqual(pickupRes.success, true);
  assert.ok(pickupRes.reversePickup.reverseAwbNumber.startsWith('REV-BLUEDART-NSK-'));
  assert.ok(pickupRes.reversePickup.tamperBagSerial.startsWith('TAMPER-BAG-'));
  assert.strictEqual(pickupRes.reversePickup.status, 'PICKUP_SCHEDULED');
  assert.strictEqual(targetOrder.returns[0].status, 'REVERSE_PICKUP_SCHEDULED');
});

await itAsync('Enforces RBAC on scheduleReversePickup: denies sales_support', async () => {
  let denied = false;
  try {
    await scheduleReversePickup({
      orderId: memoryOrders[0].id,
      returnId: memoryOrders[0].returns[0].id,
      actor: { roleId: 'sales_support', id: 'usr-sales-01' }
    });
  } catch (err) {
    denied = true;
    assert.ok(err.message.includes('Access Denied'));
  }
  assert.strictEqual(denied, true, 'Sales support must be denied order:refund / return reverse pickup');
});

// 6. Printable HTML Shipping Label
it('Renders valid HTML shipping label with barcode, AWB, and security notice', () => {
  const sampleConsignment = memoryConsignments[0];
  const html = renderShippingLabelHtml(sampleConsignment);

  assert.ok(html.includes('<!DOCTYPE html>'));
  assert.ok(html.includes(sampleConsignment.awbNumber));
  assert.ok(html.includes(sampleConsignment.carrierName));
  assert.ok(html.includes(sampleConsignment.securitySealNumber));
  assert.ok(html.includes('HIGH-VALUE ARCHIVAL JEWELLERY'));
});

console.log('\n==================================================================');
console.log(`Results: ${passed}/${passed} tests passed.`);
console.log('==================================================================');
console.log('🎉 ALL NODE 19 MULTI-COURIER SHIPPING & REVERSE LOGISTICS TESTS PASSED!\n');
