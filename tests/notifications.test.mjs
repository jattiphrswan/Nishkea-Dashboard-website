/**
 * NISHKÈA Node 18: Automated Omnichannel Notifications Engine Acceptance Tests
 * Run: node tests/notifications.test.mjs
 */

import {
  getNotificationChannels,
  renderWhatsAppMessage,
  renderHtmlEmail,
  sendNotification,
  notifyOrderConfirmed,
  notifyOrderDispatched,
  getNotificationAuditLogs,
  memoryNotificationLedger,
  memoryProcessedNotificationKeys
} from '../src/lib/server/notifications.js';

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

async function runNotificationTests() {
  console.log('==================================================================');
  console.log('NISHKÈA Node 18: Omnichannel Notifications Acceptance Tests');
  console.log('==================================================================\n');

  // 1. Channel Detection & Sandbox Fallback
  const channels = getNotificationChannels();
  assert(channels.whatsapp !== undefined && channels.email !== undefined, 'Notification channels state successfully resolved');
  assert(typeof channels.isSandbox === 'boolean', 'Reports sandbox simulator fallback mode cleanly');

  // Sample Order Data
  const sampleOrder = {
    orderNumber: 'NSK-2026-9042',
    orderTotalMinor: 499800, // ₹4,998.00
    subtotalMinor: 499800,
    customer: {
      name: 'Gayatri Devi',
      email: 'gayatri.devi@example.com',
      phone: '+91 98200 11223'
    },
    shippingAddress: {
      addressLine1: '402, Sea Green Apartments, Worli',
      addressLine2: 'Near Flora Fountain',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400018',
      country: 'India'
    },
    lines: [
      {
        designName: 'Aurelia Filigree Chandelier Drops',
        colour: 'Antique Gold',
        quantity: 2,
        unitPriceMinor: 249900,
        lineTotalMinor: 499800
      }
    ]
  };

  // 2. WhatsApp Message Template Rendering
  const waConfirm = renderWhatsAppMessage('ORDER_CONFIRMED', {
    customerName: sampleOrder.customer.name,
    orderNumber: sampleOrder.orderNumber,
    items: [
      { name: 'Aurelia Filigree Chandelier Drops', variant: 'Antique Gold', quantity: 2, lineTotalMinor: 499800 }
    ],
    totalMinor: sampleOrder.orderTotalMinor,
    city: sampleOrder.shippingAddress.city,
    state: sampleOrder.shippingAddress.state,
    postalCode: sampleOrder.shippingAddress.postalCode
  });

  assert(waConfirm.includes('TERONA NISHKÈA ATELIER'), 'WhatsApp header includes authentic atelier brand title');
  assert(waConfirm.includes('Gayatri Devi'), 'WhatsApp confirmation addresses customer by name');
  assert(waConfirm.includes('NSK-2026-9042'), 'WhatsApp confirmation contains exact order number');
  assert(waConfirm.includes('₹4,998'), 'WhatsApp total formatted in exact rupee units from minor paise');
  assert(waConfirm.includes('Mumbai, Maharashtra — 400018'), 'WhatsApp message contains courier destination');

  // Privacy Check: Ensure no internal supplier costs, wholesale POs, or margins are present
  assert(!waConfirm.includes('supplierCost'), 'Strictly isolates supplier cost from WhatsApp templates');
  assert(!waConfirm.includes('marginMinor'), 'Strictly isolates internal profit margin from client messages');
  assert(!waConfirm.includes('PO-'), 'Strictly isolates internal purchase order references');

  // WhatsApp Dispatch Message
  const waDispatch = renderWhatsAppMessage('ORDER_DISPATCHED', {
    customerName: sampleOrder.customer.name,
    orderNumber: sampleOrder.orderNumber,
    carrier: 'BlueDart Express',
    trackingNumber: 'BLUEDART-NSK-449102',
    trackingUrl: 'http://localhost:3000/account?tracking=BLUEDART-NSK-449102'
  });
  assert(waDispatch.includes('BlueDart Express'), 'WhatsApp dispatch contains courier carrier');
  assert(waDispatch.includes('BLUEDART-NSK-449102'), 'WhatsApp dispatch contains AWB tracking number');
  assert(waDispatch.includes('tamper-evident'), 'WhatsApp dispatch states transit insurance & seal advisory');

  // 3. Luxury HTML Email Rendering
  const htmlConfirm = renderHtmlEmail('ORDER_CONFIRMED', {
    customerName: sampleOrder.customer.name,
    orderNumber: sampleOrder.orderNumber,
    items: [
      { name: 'Aurelia Filigree Chandelier Drops', variant: 'Antique Gold', quantity: 2, lineTotalMinor: 499800 }
    ],
    totalMinor: sampleOrder.orderTotalMinor,
    subtotalMinor: sampleOrder.subtotalMinor,
    addressLine1: sampleOrder.shippingAddress.addressLine1,
    addressLine2: sampleOrder.shippingAddress.addressLine2,
    city: sampleOrder.shippingAddress.city,
    state: sampleOrder.shippingAddress.state,
    postalCode: sampleOrder.shippingAddress.postalCode
  });

  assert(htmlConfirm.startsWith('\n<!DOCTYPE html>') || htmlConfirm.includes('<!DOCTYPE html>'), 'Email renders valid modern HTML5 doctype');
  assert(htmlConfirm.includes('#781D39'), 'Email applies NISHKÈA Royal Burgundy brand gradient');
  assert(htmlConfirm.includes('#B69763'), 'Email applies 18K Champagne Gold accents');
  assert(htmlConfirm.includes('Aurelia Filigree Chandelier Drops'), 'Email itemizes design titles in table');
  assert(htmlConfirm.includes('₹4,998'), 'Email displays exact grand total in Indian Rupees');
  assert(htmlConfirm.includes('Colaba Crescent, Mumbai'), 'Email footer includes flagship showroom provenance');
  assert(!htmlConfirm.includes('undefined') && !htmlConfirm.includes('NaN'), 'Email is free of undefined or NaN tokens');

  // 4. Notification Dispatch Service
  const initialLedgerCount = memoryNotificationLedger.length;
  const dispatchResult = await sendNotification({
    recipient: {
      name: sampleOrder.customer.name,
      email: sampleOrder.customer.email,
      phone: sampleOrder.customer.phone
    },
    templateId: 'ORDER_CONFIRMED',
    data: {
      customerName: sampleOrder.customer.name,
      orderNumber: sampleOrder.orderNumber,
      items: [
        { name: 'Aurelia Filigree Chandelier Drops', variant: 'Antique Gold', quantity: 2, lineTotalMinor: 499800 }
      ],
      totalMinor: sampleOrder.orderTotalMinor,
      city: sampleOrder.shippingAddress.city,
      state: sampleOrder.shippingAddress.state,
      postalCode: sampleOrder.shippingAddress.postalCode,
      addressLine1: sampleOrder.shippingAddress.addressLine1
    },
    channels: ['whatsapp', 'email'],
    idempotencyKey: 'idemp-notif-test-01'
  });

  assert(dispatchResult.success === true, 'Notification dispatched successfully');
  assert(dispatchResult.notificationId.startsWith('notif_'), `Generated unique notification ID: ${dispatchResult.notificationId}`);
  assert(dispatchResult.deliveries.length === 2, 'Delivered across both WhatsApp and Email channels');
  assert(dispatchResult.deliveries.some((d) => d.channel === 'whatsapp' && d.status === 'DELIVERED'), 'WhatsApp delivered successfully');
  assert(dispatchResult.deliveries.some((d) => d.channel === 'email' && d.status === 'DELIVERED'), 'Email delivered successfully');
  assert(memoryNotificationLedger.length === initialLedgerCount + 1, 'Delivery record appended to audit ledger');

  // 5. Idempotency Deduplication Guardrail
  const duplicateDispatch = await sendNotification({
    recipient: {
      name: sampleOrder.customer.name,
      email: sampleOrder.customer.email,
      phone: sampleOrder.customer.phone
    },
    templateId: 'ORDER_CONFIRMED',
    data: {},
    channels: ['whatsapp', 'email'],
    idempotencyKey: 'idemp-notif-test-01' // Same key
  });

  assert(duplicateDispatch.deduplicated === true, 'Duplicate notification intercepted via idempotency key');
  assert(memoryNotificationLedger.length === initialLedgerCount + 1, 'Duplicate was not appended to delivery ledger');

  // 6. High-Level Integration Trigger: notifyOrderConfirmed
  const orderConfirmResult = await notifyOrderConfirmed(sampleOrder);
  assert(orderConfirmResult.success === true, 'notifyOrderConfirmed integration dispatches successfully');

  // 7. High-Level Integration Trigger: notifyOrderDispatched
  const orderDispatchResult = await notifyOrderDispatched(sampleOrder, {
    carrier: 'BlueDart Express',
    trackingNumber: 'BLUEDART-NSK-881920'
  });
  assert(orderDispatchResult.success === true, 'notifyOrderDispatched integration dispatches successfully');
  assert(orderDispatchResult.deliveries.length === 3, 'Dispatch alerts deliver to WhatsApp, Email, and SMS');

  // 8. Backoffice Audit Log Retrieval & RBAC Guardrail
  const auditLogs = await getNotificationAuditLogs({
    limit: 10,
    user: { id: 'usr-mgr-01', roleId: 'manager' }
  });
  assert(auditLogs.success === true, 'Operations Manager permitted to inspect notification delivery logs');
  assert(auditLogs.notifications.length >= 3, 'Audit logs return recent dispatched notifications');

  // Denied Access for Unauthorized Role
  try {
    await getNotificationAuditLogs({
      limit: 10,
      user: { id: 'usr-sales-01', roleId: 'sales_support' }
    });
    assert(false, 'Should throw error when sales_support probes audit logs');
  } catch (rbacErr) {
    assert(rbacErr.message.includes('Access Denied') || rbacErr.message.includes('Unauthorized'), `Enforces RBAC on notification logs: ${rbacErr.message}`);
  }

  console.log('\n==================================================================');
  console.log(`Results: ${passedTests}/${totalTests} tests passed.`);
  console.log('==================================================================');

  if (passedTests === totalTests) {
    console.log('🎉 ALL NODE 18 OMNICHANNEL NOTIFICATIONS TESTS PASSED!\n');
  } else {
    process.exit(1);
  }
}

runNotificationTests().catch((err) => {
  console.error('Unhandled test error:', err);
  process.exit(1);
});
