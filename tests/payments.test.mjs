/**
 * NISHKÈA Node 17: Live Payment Gateway Engine & Multi-Provider Adapter Acceptance Tests
 * Run: node tests/payments.test.mjs
 */

import crypto from 'crypto';
import {
  getActiveProvider,
  getPublicPaymentConfig,
  calculateJewelleryEmi,
  createPaymentOrder,
  verifyPaymentSignature,
  confirmOrderPayment,
  processGatewayWebhook,
  initiateGatewayRefund,
  GATEWAY_CONFIG
} from '../src/lib/server/payments.js';
import { createOrder, memoryOrders } from '../src/lib/server/orders.js';
import { memoryCustomerPayments } from '../src/lib/server/finance.js';

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

async function runPaymentTests() {
  console.log('==================================================================');
  console.log('NISHKÈA Node 17: Payment Gateway, Cryptographic Verification & EMI Tests');
  console.log('==================================================================\n');

  // 1. Gateway Provider Detection & Public Config
  const provider = getActiveProvider();
  assert(typeof provider === 'string' && ['razorpay', 'stripe', 'sandbox'].includes(provider), `Active provider detected: ${provider}`);

  const publicConfig = getPublicPaymentConfig();
  assert(publicConfig.currency === 'INR', 'Public config enforces INR currency standard');
  assert(publicConfig.supportedMethods.length === 4, 'Provides 4 supported methods (UPI, Card, NetBanking, EMI)');
  assert(publicConfig.supportedMethods.some((m) => m.id === 'upi'), 'UPI instant is supported');
  assert(publicConfig.theme.themeColor === '#781D39', 'Theme aligns with NISHKÈA royal burgundy');

  // 2. Haute Joaillerie No-Cost & Low-Cost EMI Calculator
  const subThresholdEmi = calculateJewelleryEmi(249900); // ₹2,499.00 (< ₹3,000 threshold)
  assert(subThresholdEmi.eligible === false, 'Designs under ₹3,000 threshold are not eligible for financing');

  const qualifyingEmi = calculateJewelleryEmi(600000); // ₹6,000.00
  assert(qualifyingEmi.eligible === true, 'Designs >= ₹3,000 are eligible for jewellery EMI');
  assert(qualifyingEmi.plans.length === 4, 'Calculates 3, 6, 9, and 12-month tenure plans');

  const plan3M = qualifyingEmi.plans.find((p) => p.tenureMonths === 3);
  assert(plan3M.isNoCost === true, '3-Month plan is 0% interest No-Cost EMI');
  assert(plan3M.monthlyInstalmentMinor === 200000, `Monthly instalment is exact integer paise: ${plan3M.monthlyInstalmentMinor} (₹2,000.00/mo)`);
  assert(plan3M.totalPayableMinor === 600000, 'No-Cost total payable exactly matches retail price');

  const plan6M = qualifyingEmi.plans.find((p) => p.tenureMonths === 6);
  assert(plan6M.isNoCost === true, '6-Month plan is 0% interest No-Cost EMI');
  assert(plan6M.monthlyInstalmentMinor === 100000, `6-Month instalment: ${plan6M.monthlyInstalmentMinor} paise (₹1,000.00/mo)`);

  // 3. Create Checkout Order & Gateway Order Session
  const testCustomer = {
    name: 'Meera Rajput',
    email: 'meera.rajput@example.com',
    phone: '+91 98112 23344'
  };
  const testAddress = {
    addressLine1: 'Villa 14, Royal Palms Estate',
    city: 'Jaipur',
    state: 'Rajasthan',
    postalCode: '302001',
    country: 'India'
  };

  const orderResult = await createOrder({
    customer: testCustomer,
    shippingAddress: testAddress,
    items: [{ sku: 'NSK-EAR-001-GLD', quantity: 2 }], // 2 * ₹2,499 = ₹4,998 (499800 paise)
    idempotencyKey: 'idemp-payment-test-01'
  });
  const testOrder = orderResult.order;
  assert(testOrder.orderTotalMinor === 499800, 'Order total matches 499800 paise (₹4,998.00)');
  assert(testOrder.paymentStatus === 'PENDING', 'Initial order status is PENDING');

  // Create Gateway Order
  const gatewayOrder = await createPaymentOrder({
    orderNumber: testOrder.orderNumber,
    amountMinor: testOrder.orderTotalMinor,
    customer: testCustomer,
    notes: { occasion: 'Diwali Festive Gifting' }
  });
  assert(gatewayOrder.success === true, 'Gateway payment order created successfully');
  assert(typeof gatewayOrder.gatewayOrderId === 'string' && gatewayOrder.gatewayOrderId.length > 8, `Generated Gateway Order ID: ${gatewayOrder.gatewayOrderId}`);
  assert(gatewayOrder.amountMinor === testOrder.orderTotalMinor, 'Gateway order amount matches order total');

  // Amount Mismatch Guardrail
  try {
    await createPaymentOrder({
      orderNumber: testOrder.orderNumber,
      amountMinor: 100000 // Incorrect amount
    });
    assert(false, 'Should throw error when amount mismatches order total');
  } catch (err) {
    assert(err.message.includes('mismatch'), `Rejects amount mismatch: ${err.message}`);
  }

  // Float Amount Guardrail
  try {
    await createPaymentOrder({
      orderNumber: testOrder.orderNumber,
      amountMinor: 4998.50 // Floating point error
    });
    assert(false, 'Should throw error on floating point amount');
  } catch (err) {
    assert(err.message.includes('positive integer'), 'Rejects non-integer minor currency amount');
  }

  // 4. HMAC SHA-256 Cryptographic Signature Verification
  const gatewayOrderId = gatewayOrder.gatewayOrderId;
  const gatewayPaymentId = `pay_rzp_mock_${Date.now()}`;
  const secretToUse = GATEWAY_CONFIG.sandboxSecret;

  // Generate legitimate signature
  const validSignature = crypto
    .createHmac('sha256', secretToUse)
    .update(`${gatewayOrderId}|${gatewayPaymentId}`)
    .digest('hex');

  const isValid = verifyPaymentSignature({
    gatewayOrderId,
    gatewayPaymentId,
    signature: validSignature,
    provider: 'sandbox',
    secret: secretToUse
  });
  assert(isValid === true, 'Cryptographic signature verification passes for valid HMAC token');

  // Tampered Signature Rejection
  const tamperedSignature = validSignature.slice(0, -4) + 'abcd';
  const isTamperedValid = verifyPaymentSignature({
    gatewayOrderId,
    gatewayPaymentId,
    signature: tamperedSignature,
    provider: 'sandbox',
    secret: secretToUse
  });
  assert(isTamperedValid === false, 'Strictly rejects forged or tampered signature');

  // Missing Field Rejection
  assert(verifyPaymentSignature({ gatewayOrderId: null, gatewayPaymentId, signature: validSignature }) === false, 'Rejects null order ID');
  assert(verifyPaymentSignature({ gatewayOrderId, gatewayPaymentId: null, signature: validSignature }) === false, 'Rejects null payment ID');

  // 5. Confirm Order Payment (State Transition, Stock Allocation & Finance Ledger)
  const initialCustomerPaymentCount = memoryCustomerPayments.length;

  const confirmation = await confirmOrderPayment({
    orderNumber: testOrder.orderNumber,
    gatewayOrderId,
    gatewayPaymentId,
    signature: validSignature,
    paymentMethod: 'UPI_GPAY',
    provider: 'sandbox',
    actorId: 'test_user'
  });

  assert(confirmation.success === true, 'Payment confirmation succeeds');
  assert(confirmation.paymentStatus === 'PAID', 'Order transitions to PAID status');
  assert(confirmation.fulfillmentStatus === 'PENDING_PICKING', 'Order transitions to PENDING_PICKING fulfillment state');
  assert(testOrder.paymentStatus === 'PAID', 'Order record in memory updated to PAID');
  assert(testOrder.paymentReference === gatewayPaymentId, 'Payment reference assigned to order');

  // Verify Financial Ledger Integration
  assert(memoryCustomerPayments.length === initialCustomerPaymentCount + 1, 'Verified customer receipt automatically appended to commercial accounts ledger');
  const latestReceipt = memoryCustomerPayments[0];
  assert(latestReceipt.orderNumber === testOrder.orderNumber, 'Receipt order number matches confirmed order');
  assert(latestReceipt.amountMinor === 499800, 'Receipt amount matches 499800 paise');

  // Double-payment confirmation idempotency check
  const duplicateConfirm = await confirmOrderPayment({
    orderNumber: testOrder.orderNumber,
    gatewayOrderId,
    gatewayPaymentId,
    signature: validSignature,
    provider: 'sandbox'
  });
  assert(duplicateConfirm.alreadyPaid === true, 'Subsequent confirmation gracefully returns alreadyPaid without double-recording');

  // 6. Webhook Processing & Deduplication
  const webhookEventId = `evt_test_${Date.now()}`;
  const webhookBody = {
    event_id: webhookEventId,
    event: 'payment.captured',
    payload: {
      payment: {
        entity: {
          id: `pay_wh_${Date.now()}`,
          order_id: gatewayOrderId,
          notes: { orderNumber: testOrder.orderNumber }
        }
      }
    }
  };

  const rawBodyString = JSON.stringify(webhookBody);
  const webhookSig = crypto.createHmac('sha256', secretToUse).update(rawBodyString).digest('hex');

  const webhookResult = await processGatewayWebhook({
    rawBody: rawBodyString,
    signature: webhookSig,
    provider: 'sandbox'
  });
  assert(webhookResult.success === true, 'Webhook event processed successfully');

  // Webhook Deduplication
  const deduplicatedWebhook = await processGatewayWebhook({
    rawBody: rawBodyString,
    signature: webhookSig,
    provider: 'sandbox'
  });
  assert(deduplicatedWebhook.deduplicated === true, 'Duplicate webhook event identified and skipped via idempotency ledger');

  // 7. Bounded Gateway Refunds
  // First test excessive refund bounds check on PAID order
  try {
    await initiateGatewayRefund({
      orderNumber: testOrder.orderNumber,
      amountMinor: 9999999, // Exceeds paid total
      user: { id: 'usr-mgr-01', roleId: 'manager' }
    });
    assert(false, 'Should throw error when refund exceeds order total');
  } catch (refundErr) {
    assert(refundErr.message.includes('must be between'), `Rejects excessive refund: ${refundErr.message}`);
  }

  // Unauthorized Staff Refund Rejection
  try {
    await initiateGatewayRefund({
      orderNumber: testOrder.orderNumber,
      amountMinor: 100000,
      user: { id: 'usr-sales-01', roleId: 'sales_support' }
    });
    assert(false, 'Should throw error for unauthorized staff');
  } catch (authErr) {
    assert(authErr.message.includes('Access Denied') || authErr.message.includes('Unauthorized'), `Enforces RBAC on refund: ${authErr.message}`);
  }

  // Successful Full Refund
  const refundResult = await initiateGatewayRefund({
    orderNumber: testOrder.orderNumber,
    amountMinor: 499800,
    reason: 'Defective item returned under warranty',
    user: { id: 'usr-mgr-01', roleId: 'manager' }
  });
  assert(refundResult.success === true, 'Full gateway refund processed successfully');
  assert(refundResult.status === 'REFUNDED', 'Order status updated to REFUNDED');
  assert(typeof refundResult.refundId === 'string' && refundResult.refundId.startsWith('rfnd_'), `Generated Gateway Refund ID: ${refundResult.refundId}`);

  console.log('\n==================================================================');
  console.log(`Results: ${passedTests}/${totalTests} tests passed.`);
  console.log('==================================================================');

  if (passedTests === totalTests) {
    console.log('🎉 ALL NODE 17 PAYMENT GATEWAY & CRYPTOGRAPHIC TESTS PASSED!\n');
  } else {
    process.exit(1);
  }
}

runPaymentTests().catch((err) => {
  console.error('Unhandled test error:', err);
  process.exit(1);
});
