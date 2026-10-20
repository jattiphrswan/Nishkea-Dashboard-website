/**
 * Node 8 Acceptance Gate Test Suite: Checkout, Payments, Shipping & Returns
 * Run: node tests/checkout.test.mjs
 */

import crypto from 'crypto';
import {
  createOrder,
  verifyWebhookSignature,
  handlePaymentWebhook,
  dispatchOrder,
  requestOrderReturn,
  inspectAndResolveReturn,
  CHECKOUT_CONFIG,
  memoryOrders
} from '../src/lib/server/orders.js';
import { getVariantStockSummary } from '../src/lib/server/inventory.js';

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

async function runCheckoutTests() {
  console.log('==================================================================');
  console.log('NISHKÈA Node 8: Checkout, Webhook, Shipping & Returns Tests');
  console.log('==================================================================\n');

  // Test Customer & Address
  const customer = {
    name: 'Ananya Deshmukh',
    email: 'ananya.d@example.com',
    phone: '+91 99887 76655'
  };

  const shippingAddress = {
    addressLine1: 'B-1402, Signature Towers, Bandra West',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400050',
    country: 'India'
  };

  // 1. Order Creation & Minor Currency Calculations (Free Shipping >= ₹3,000)
  // Aurelia Earrings: ₹2,499 (249900 paise) * 2 = ₹4,998 (499800 paise) >= ₹3,000 => Free Shipping
  const qualifyingOrderResult = await createOrder({
    customer,
    shippingAddress,
    items: [{ sku: 'NSK-EAR-001-GLD', quantity: 2 }],
    idempotencyKey: 'idemp-test-free-ship-01'
  });

  assert(qualifyingOrderResult.success === true, 'Order created successfully with valid inputs');
  const order1 = qualifyingOrderResult.order;
  assert(order1.orderNumber.startsWith('NSK-2026-'), `Generated human-readable order number: ${order1.orderNumber}`);
  assert(order1.subtotalMinor === 499800, `Subtotal matches server price: ${order1.subtotalMinor} paise (₹4,998.00)`);
  assert(order1.shippingFeeMinor === 0, 'Shipping fee is ₹0.00 for orders above ₹3,000 threshold');
  assert(order1.orderTotalMinor === 499800, `Order total matches subtotal: ${order1.orderTotalMinor}`);
  assert(order1.currency === 'INR', 'Explicit currency standard is INR');
  assert(order1.paymentStatus === 'PENDING', 'Initial payment status is PENDING');
  assert(order1.fulfillmentStatus === 'UNFULFILLED', 'Initial fulfillment state is UNFULFILLED');
  assert(order1.allReservationIds.length >= 1, 'Atomic stock reservation created for order lines');

  // 2. Standard Shipping Fee (< ₹3,000 Threshold)
  // Scrunchie Set: ₹1,499 (149900 paise) * 1 = ₹1,499 < ₹3,000 => Shipping fee ₹250 (25000 paise)
  const feeOrderResult = await createOrder({
    customer,
    shippingAddress,
    items: [{ sku: 'NSK-HAR-004-IVR', quantity: 1 }],
    idempotencyKey: 'idemp-test-fee-ship-02'
  });

  const order2 = feeOrderResult.order;
  assert(order2.subtotalMinor === 149900, `Subtotal: ${order2.subtotalMinor} paise (₹1,499.00)`);
  assert(order2.shippingFeeMinor === 25000, `Shipping fee is ₹250.00 (25000 paise) below threshold: ${order2.shippingFeeMinor}`);
  assert(order2.orderTotalMinor === 174900, `Total equals subtotal + standard shipping fee: ${order2.orderTotalMinor} paise (₹1,749.00)`);

  // 3. Idempotency Check: Resubmitting Same Idempotency Key
  const replayResult = await createOrder({
    customer,
    shippingAddress,
    items: [{ sku: 'NSK-HAR-004-IVR', quantity: 1 }],
    idempotencyKey: 'idemp-test-fee-ship-02'
  });
  assert(replayResult.idempotentReplay === true, 'Resubmitting with identical idempotency key returns existing order');
  assert(replayResult.order.id === order2.id, 'Idempotent response preserves original order identity');

  // 4. Zero-Overselling Hard Gate: Rejecting Order Exceeding Available Stock (409 Conflict)
  let oversellFailed = false;
  try {
    await createOrder({
      customer,
      shippingAddress,
      items: [{ sku: 'NSK-NCK-003-BUR', quantity: 999 }] // Only 4 units available
    });
  } catch (err) {
    oversellFailed = true;
    assert(err.message.includes('Insufficient available vault stock'), `Zero-overselling error caught: ${err.message}`);
    assert(err.statusCode === 409, 'Returns HTTP 409 Conflict error for stock shortage');
  }
  assert(oversellFailed, 'Checkout strictly blocks overselling beyond available inventory');

  // 5. Payment Webhook HMAC SHA-256 Signature Verification
  const testPayload = JSON.stringify({
    event_id: 'evt_test_success_99',
    event_type: 'payment.succeeded',
    orderNumber: order1.orderNumber,
    paymentId: 'pay_rzp_mock_12345'
  });

  const validSignature = crypto
    .createHmac('sha256', CHECKOUT_CONFIG.webhookSecret)
    .update(testPayload)
    .digest('hex');

  const signaturePassed = verifyWebhookSignature({
    rawBody: testPayload,
    signature: validSignature,
    secret: CHECKOUT_CONFIG.webhookSecret
  });
  assert(signaturePassed === true, 'Valid HMAC SHA-256 webhook signature passes verification');

  const forgedSignature = 'forged_deadbeef_signature_1234567890';
  const signatureRejected = verifyWebhookSignature({
    rawBody: testPayload,
    signature: forgedSignature,
    secret: CHECKOUT_CONFIG.webhookSecret
  });
  assert(signatureRejected === false, 'Tampered or invalid signature is strictly rejected');

  // 6. Payment Webhook State Transition: PENDING -> PAID and PENDING_PICKING
  const webhookResult = await handlePaymentWebhook({
    eventId: 'evt_test_success_99',
    eventType: 'payment.succeeded',
    payload: {
      orderNumber: order1.orderNumber,
      paymentId: 'pay_rzp_mock_12345'
    },
    signature: validSignature,
    rawBody: testPayload
  });

  assert(webhookResult.success === true, 'Payment webhook processed successfully');
  assert(order1.paymentStatus === 'PAID', `Order payment status transitioned to PAID: ${order1.paymentStatus}`);
  assert(order1.fulfillmentStatus === 'PENDING_PICKING', `Fulfillment transitioned to PENDING_PICKING: ${order1.fulfillmentStatus}`);

  // 7. Webhook Event Deduplication (Idempotency)
  const duplicateWebhook = await handlePaymentWebhook({
    eventId: 'evt_test_success_99',
    eventType: 'payment.succeeded',
    payload: { orderNumber: order1.orderNumber }
  });
  assert(duplicateWebhook.deduplicated === true, 'Duplicate webhook event is safely deduplicated without side effects');

  // 8. Payment Failure Webhook: Releases Stock Reservations
  const failedOrderResult = await createOrder({
    customer,
    shippingAddress,
    items: [{ sku: 'NSK-RNG-002-SZ7', quantity: 1 }],
    idempotencyKey: 'idemp-test-fail-order-03'
  });
  const orderFail = failedOrderResult.order;
  assert(orderFail.paymentStatus === 'PENDING', 'New order starts in PENDING status');

  const failWebhookResult = await handlePaymentWebhook({
    eventId: 'evt_test_fail_01',
    eventType: 'payment.failed',
    payload: {
      orderNumber: orderFail.orderNumber,
      failureReason: 'INSUFFICIENT_FUNDS'
    }
  });

  assert(failWebhookResult.success === true, 'Payment failure webhook executed');
  assert(orderFail.paymentStatus === 'FAILED', `Order marked as FAILED: ${orderFail.paymentStatus}`);

  // 9. Order Dispatch & Fulfillment: Consuming Reservations & Generating Carrier Tracking
  const dispatchResult = await dispatchOrder({
    orderId: order1.id,
    carrier: 'BlueDart Express',
    trackingNumber: 'BLUEDART-NSK-9281729',
    actorId: 'usr-warehouse-01'
  });

  assert(dispatchResult.success === true, 'Order dispatched successfully');
  assert(order1.fulfillmentStatus === 'DISPATCHED', `Fulfillment state is DISPATCHED: ${order1.fulfillmentStatus}`);
  assert(order1.tracking !== null, 'Carrier tracking details recorded');
  assert(order1.tracking.trackingNumber === 'BLUEDART-NSK-9281729', `Tracking number assigned: ${order1.tracking.trackingNumber}`);

  // 10. Customer Return Request: Bounded Rule (total returned <= shipped)
  const returnReqResult = await requestOrderReturn({
    orderId: order1.id,
    items: [{ sku: 'NSK-EAR-001-GLD', quantity: 1 }],
    reason: 'SIZE_OR_FIT',
    customerNotes: 'Too large for my evening wear ensemble'
  });

  assert(returnReqResult.success === true, 'Valid return request accepted');
  const returnRec = returnReqResult.returnRecord;
  assert(returnRec.status === 'IN_QUARANTINE', 'Initial return status is IN_QUARANTINE per inventory protocol');
  assert(returnRec.lines[0].quantity === 1, 'Return quantity recorded as 1');

  // Attempting to return more than shipped balance should fail
  let excessReturnFailed = false;
  try {
    await requestOrderReturn({
      orderId: order1.id,
      items: [{ sku: 'NSK-EAR-001-GLD', quantity: 2 }] // Already returned 1 of 2, only 1 remains eligible
    });
  } catch (err) {
    excessReturnFailed = true;
    assert(err.message.includes('exceeds eligible shipped balance'), `Excess return caught: ${err.message}`);
  }
  assert(excessReturnFailed, 'Return strictly enforces total returned <= shipped balance');

  // 11. Return Inspection & Sellable Restock Disposition
  const inspectionResult = await inspectAndResolveReturn({
    orderId: order1.id,
    returnId: returnRec.id,
    disposition: 'SELLABLE_RESTOCK',
    inspectorNotes: 'Jewellery unworn, seal intact, sanitized for restock',
    actorId: 'usr-warehouse-01'
  });

  assert(inspectionResult.success === true, 'Return inspection and disposition executed');
  assert(returnRec.status === 'INSPECTED_RESOLVED', 'Return state transitioned to INSPECTED_RESOLVED');
  assert(inspectionResult.restockedUnits === 1, 'Physical units restocked into inventory ledger');
  assert(inspectionResult.refundMinor === 249900, `Refund calculated at item price: ${inspectionResult.refundMinor} paise (₹2,499.00)`);
  assert(order1.paymentStatus === 'REFUNDED_RETURN', 'Order payment status updated to REFUNDED_RETURN');
  assert(order1.fulfillmentStatus === 'RETURNED_INSPECTED', 'Order fulfillment status updated to RETURNED_INSPECTED');

  console.log('\n==================================================================');
  console.log(`Results: ${passedTests}/${totalTests} tests passed.`);
  console.log('==================================================================');

  if (passedTests === totalTests) {
    console.log('🎉 Node 8 Acceptance Gate: ALL TESTS PASSED\n');
  } else {
    console.error('❌ Node 8 Acceptance Gate: SOME TESTS FAILED\n');
    process.exit(1);
  }
}

runCheckoutTests().catch((err) => {
  console.error('Unhandled test runner error:', err);
  process.exit(1);
});
