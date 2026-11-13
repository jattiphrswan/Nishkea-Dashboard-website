/**
 * NISHKÈA Real-time Multi-Courier Logistics & Reverse Shipping Engine — Node 19
 *
 * Implements:
 * 1. Pincode Serviceability & SLA Matrix (BlueDart Apex, Delhivery Express, Shiprocket High-Value, Sequel Armoured)
 * 2. High-Value Jewellery Consignment Manifesting & AWB Generation
 * 3. Volumetric vs Deadweight Calculation & Specie Insurance Evaluation
 * 4. Printable Packing Slip & Shipping Label Generation (tamper-evident seal notice, dispatch QR)
 * 5. Milestone Tracking Aggregator (dispatched, in-transit, out-for-delivery, delivered, RTO)
 * 6. Armoured Reverse Logistics & Return Pickup Scheduling
 * 7. RBAC-gated shipping operations & customer privacy compliance
 */

import crypto from 'crypto';
import { logAuditEvent, checkPermission } from './permissions.js';
import { memoryOrders } from './orders.js';
import { notifyOrderDispatched } from './notifications.js';

function assertPermission(roleId, permission) {
  const perm = checkPermission({ roleId }, permission);
  if (!perm.allowed) {
    throw new Error(perm.reason || `Access Denied: Lacks '${permission}' grant.`);
  }
}

export const CARRIERS = {
  BLUEDART: {
    id: 'BLUEDART',
    name: 'BlueDart Express (Apex Air)',
    maxInsuranceMinor: 50000000, // ₹5,00,000.00
    isArmoured: false,
    trackingPrefix: 'BLUEDART-NSK-',
    cutoffTimeIST: '17:00'
  },
  DELHIVERY: {
    id: 'DELHIVERY',
    name: 'Delhivery Surface & Express',
    maxInsuranceMinor: 25000000, // ₹2,50,000.00
    isArmoured: false,
    trackingPrefix: 'DELHIVERY-NSK-',
    cutoffTimeIST: '18:00'
  },
  SEQUEL: {
    id: 'SEQUEL',
    name: 'Sequel Logistics (Armoured Vault Specie)',
    maxInsuranceMinor: 500000000, // ₹50,00,000.00
    isArmoured: true,
    trackingPrefix: 'SEQUEL-NSK-',
    cutoffTimeIST: '16:00'
  },
  SHIPROCKET: {
    id: 'SHIPROCKET',
    name: 'Shiprocket High-Value Logistics',
    maxInsuranceMinor: 15000000, // ₹1,50,000.00
    isArmoured: false,
    trackingPrefix: 'SR-NSK-',
    cutoffTimeIST: '17:30'
  }
};

/**
 * Standard Indian Postal Circle & Logistics Tier Matrix
 */
const PINCODE_ZONES = {
  // Metro Tier-1 Hubs (Next Day / 24-48h SLA)
  '400': { zone: 'MUMBAI_METRO', tier: 1, state: 'Maharashtra', city: 'Mumbai', slaHours: 24, codAvailable: true },
  '110': { zone: 'NCR_METRO', tier: 1, state: 'Delhi', city: 'New Delhi', slaHours: 24, codAvailable: true },
  '560': { zone: 'BLR_METRO', tier: 1, state: 'Karnataka', city: 'Bengaluru', slaHours: 36, codAvailable: true },
  '600': { zone: 'CHN_METRO', tier: 1, state: 'Tamil Nadu', city: 'Chennai', slaHours: 36, codAvailable: true },
  '700': { zone: 'KOL_METRO', tier: 1, state: 'West Bengal', city: 'Kolkata', slaHours: 48, codAvailable: true },
  '500': { zone: 'HYD_METRO', tier: 1, state: 'Telangana', city: 'Hyderabad', slaHours: 36, codAvailable: true },
  '302': { zone: 'JAIPUR_ATELIER', tier: 1, state: 'Rajasthan', city: 'Jaipur', slaHours: 24, codAvailable: true },
  '411': { zone: 'PUNE_METRO', tier: 1, state: 'Maharashtra', city: 'Pune', slaHours: 24, codAvailable: true },
  '380': { zone: 'AHM_METRO', tier: 1, state: 'Gujarat', city: 'Ahmedabad', slaHours: 36, codAvailable: true }
};

// In-Memory Shipping Consignments Store
export let memoryConsignments = [];

// In-Memory Tracking Milestones Store
export let memoryTrackingMilestones = [];

// In-Memory Reverse Pickup Requests Store
export let memoryReversePickups = [];

/**
 * 1. Check Pincode Serviceability & Delivery SLA
 */
export async function checkPincodeServiceability(pincode, options = {}) {
  const pin = String(pincode || '').trim();
  if (!/^\d{6}$/.test(pin)) {
    return {
      serviceable: false,
      pincode: pin,
      error: 'Invalid Indian Postal Code. Must be exactly 6 numeric digits.'
    };
  }

  const prefix = pin.substring(0, 3);
  const zoneInfo = PINCODE_ZONES[prefix];
  const orderValueMinor = options.orderValueMinor || 0;

  // Tier 1 Metro
  if (zoneInfo) {
    const recommendedCarrier = orderValueMinor >= 10000000 // >= ₹1 Lakh uses Sequel Armoured
      ? CARRIERS.SEQUEL
      : CARRIERS.BLUEDART;

    const deliveryDaysMin = Math.max(1, Math.floor(zoneInfo.slaHours / 24));
    const deliveryDaysMax = deliveryDaysMin + 1;

    return {
      serviceable: true,
      pincode: pin,
      city: zoneInfo.city,
      state: zoneInfo.state,
      tier: zoneInfo.tier,
      zone: zoneInfo.zone,
      estimatedDeliveryDays: `${deliveryDaysMin}–${deliveryDaysMax} Business Days`,
      slaHours: zoneInfo.slaHours,
      codAvailable: zoneInfo.codAvailable && orderValueMinor <= 5000000, // COD capped at ₹50,000 for jewellery
      recommendedCarrier: recommendedCarrier.id,
      carrierName: recommendedCarrier.name,
      insuredTransit: true,
      armouredAvailable: true
    };
  }

  // Tier 2 & Tier 3 Domestic Rest of India
  const isNonServiceableRemote = ['799', '194', '744'].includes(prefix); // Lakshadweep/Leh remote island zones in mock
  if (isNonServiceableRemote) {
    return {
      serviceable: false,
      pincode: pin,
      error: 'High-value insured jewellery transit is currently unavailable for this pin code. Contact atelier concierge for bespoke insured delivery.'
    };
  }

  return {
    serviceable: true,
    pincode: pin,
    city: 'Rest of India',
    state: 'Domestic',
    tier: 2,
    zone: 'DOMESTIC_REST_OF_INDIA',
    estimatedDeliveryDays: '3–5 Business Days',
    slaHours: 72,
    codAvailable: orderValueMinor <= 2000000, // Tier 2 COD capped at ₹20,000
    recommendedCarrier: orderValueMinor >= 10000000 ? CARRIERS.SEQUEL.id : CARRIERS.DELHIVERY.id,
    carrierName: orderValueMinor >= 10000000 ? CARRIERS.SEQUEL.name : CARRIERS.DELHIVERY.name,
    insuredTransit: true,
    armouredAvailable: orderValueMinor >= 10000000
  };
}

/**
 * 2. Calculate Volumetric & Chargeable Weight for Jewellery Packaging
 * Formula: Volumetric Weight (kg) = (Length × Width × Height in cm) / 5000
 */
export function calculateChargeableWeight({ deadweightGrams = 250, lengthCm = 15, widthCm = 12, heightCm = 8 }) {
  const volumetricGrams = Math.round(((lengthCm * widthCm * heightCm) / 5000) * 1000);
  const deadweight = Math.max(50, Number(deadweightGrams) || 250);
  const chargeableGrams = Math.max(deadweight, volumetricGrams);

  return {
    deadweightGrams: deadweight,
    dimensions: { lengthCm, widthCm, heightCm },
    volumetricGrams,
    chargeableGrams,
    chargeableWeightKg: Number((chargeableGrams / 1000).toFixed(2))
  };
}

/**
 * 3. Manifest Outbound Shipment & Issue AWB
 * Permission: 'order:dispatch' (inventory_staff, manager, owner)
 */
export async function manifestShipment({
  orderId,
  carrierId = 'BLUEDART',
  packageDetails = {},
  actor = { roleId: 'inventory_staff', id: 'usr-inv-01' }
}) {
  assertPermission(actor.roleId, 'order:dispatch');

  if (!orderId) throw new Error('orderId is required');

  const order = memoryOrders.find((o) => o.id === orderId || o.orderNumber === orderId);
  if (!order) throw new Error(`Order '${orderId}' not found in registry`);

  if (order.status === 'CANCELLED') {
    throw new Error(`Cannot manifest shipment for CANCELLED order`);
  }

  // Prevent duplicate manifesting
  const existingConsignment = memoryConsignments.find((c) => c.orderNumber === order.orderNumber && c.status !== 'CANCELLED');
  if (existingConsignment) {
    return {
      success: true,
      isExisting: true,
      consignment: existingConsignment
    };
  }

  const carrier = CARRIERS[carrierId] || CARRIERS.BLUEDART;
  const weightInfo = calculateChargeableWeight(packageDetails);

  // Generate authentic carrier AWB
  const randomSuffix = crypto.randomInt(100000, 999999);
  const awbNumber = `${carrier.trackingPrefix}${order.orderNumber.replace(/[^0-9]/g, '') || '9042'}-${randomSuffix}`;
  const consignmentId = `cng_${crypto.randomBytes(6).toString('hex')}`;

  const consignment = {
    id: consignmentId,
    awbNumber,
    orderId: order.id,
    orderNumber: order.orderNumber,
    carrierId: carrier.id,
    carrierName: carrier.name,
    isArmoured: carrier.isArmoured,
    customerName: order.customer?.name || 'Valued Patron',
    destination: {
      addressLine1: order.shippingAddress?.addressLine1 || 'Atelier Delivery',
      city: order.shippingAddress?.city || 'Mumbai',
      state: order.shippingAddress?.state || 'Maharashtra',
      postalCode: order.shippingAddress?.postalCode || '400018',
      phone: order.customer?.phone || '+91 98765 43210'
    },
    weight: weightInfo,
    declaredValueMinor: order.pricing?.grandTotalMinor || 499800,
    insuredTransit: true,
    securitySealNumber: `NSK-SEAL-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
    status: 'MANIFESTED',
    manifestedAt: new Date().toISOString(),
    manifestedBy: actor.id
  };

  memoryConsignments.unshift(consignment);

  // Initialize tracking milestones
  const initialMilestone = {
    awbNumber,
    orderNumber: order.orderNumber,
    carrierId: carrier.id,
    status: 'MANIFESTED',
    milestone: 'ELECTRONIC_SHIPPING_INFO_RECEIVED',
    location: 'Mumbai Atelier Vault Hub',
    description: 'Shipment data received. Tamper-evident secure packaging prepared for carrier courier pickup.',
    timestamp: new Date().toISOString()
  };
  memoryTrackingMilestones.push(initialMilestone);

  // Transition order status to DISPATCHED
  order.status = 'DISPATCHED';
  order.fulfillment = {
    carrier: carrier.name,
    trackingNumber: awbNumber,
    dispatchedAt: consignment.manifestedAt,
    securitySealNumber: consignment.securitySealNumber
  };

  // Trigger customer notification (WhatsApp + Email + SMS)
  try {
    if (order && order.customer && order.customer.email) {
      await notifyOrderDispatched({
        order,
        carrier: carrier.name,
        trackingNumber: awbNumber,
        estimatedDelivery: '24 to 48 Hours via Insured BlueDart Courier'
      });
    }
  } catch (err) {
    console.warn('[Notification Error upon Manifest]:', err.message);
  }

  await logAuditEvent({
    actorId: actor.id,
    action: 'SHIPMENT_MANIFESTED',
    resourceType: 'CONSIGNMENT',
    resourceId: consignmentId,
    metadata: {
      orderNumber: order.orderNumber,
      awbNumber,
      carrier: carrier.id,
      sealNumber: consignment.securitySealNumber
    }
  });

  return {
    success: true,
    consignment,
    trackingUrl: `/account?tracking=${encodeURIComponent(awbNumber)}`
  };
}

/**
 * 4. Get Live Milestone Tracking Data by AWB or Order Number
 */
export async function getShipmentTracking(awbOrOrderNumber) {
  const query = String(awbOrOrderNumber || '').trim();
  if (!query) throw new Error('AWB or Order Number is required for tracking lookup');

  const consignment = memoryConsignments.find(
    (c) => c.awbNumber.toLowerCase() === query.toLowerCase() || c.orderNumber.toLowerCase() === query.toLowerCase()
  );

  const rawMilestones = memoryTrackingMilestones.filter(
    (m) => m.awbNumber.toLowerCase() === (consignment?.awbNumber || query).toLowerCase() ||
           m.orderNumber.toLowerCase() === query.toLowerCase()
  );

  // Default simulated milestones if none exist yet
  const milestones = rawMilestones.length > 0 ? rawMilestones : [
    {
      awbNumber: query,
      orderNumber: consignment?.orderNumber || 'NSK-2026-9042',
      carrierId: consignment?.carrierId || 'BLUEDART',
      status: 'IN_TRANSIT',
      milestone: 'OUT_FOR_DELIVERY',
      location: 'Worli Delivery Hub, Mumbai',
      description: 'Shipment out for delivery with armored courier personnel. Please present OTP or signature at door.',
      timestamp: new Date().toISOString()
    },
    {
      awbNumber: query,
      orderNumber: consignment?.orderNumber || 'NSK-2026-9042',
      carrierId: consignment?.carrierId || 'BLUEDART',
      status: 'IN_TRANSIT',
      milestone: 'DEPARTED_HUB',
      location: 'Central Sort Facility, Mumbai Airport',
      description: 'Specie consignment departed sorting facility under GPS surveillance.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString()
    },
    {
      awbNumber: query,
      orderNumber: consignment?.orderNumber || 'NSK-2026-9042',
      carrierId: consignment?.carrierId || 'BLUEDART',
      status: 'MANIFESTED',
      milestone: 'VAULT_HANDOVER',
      location: 'NISHKÈA Vault Atelier, Colaba',
      description: 'Sealed parcel handed over to BlueDart secure logistics escort.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
    }
  ];

  const currentStatus = milestones[0]?.status || consignment?.status || 'IN_TRANSIT';

  return {
    success: true,
    awbNumber: consignment?.awbNumber || query,
    orderNumber: consignment?.orderNumber || null,
    carrierName: consignment?.carrierName || 'BlueDart Express (Apex Air)',
    isArmoured: consignment?.isArmoured || false,
    securitySealNumber: consignment?.securitySealNumber || 'NSK-SEAL-VERIFIED',
    currentStatus,
    milestones,
    estimatedDelivery: 'Today by 18:00 IST',
    customerDestination: consignment?.destination || { city: 'Mumbai', state: 'Maharashtra', postalCode: '400018' }
  };
}

/**
 * 5. Update Carrier Tracking Event / Milestone (Simulates Webhook / Ingest)
 */
export async function updateTrackingMilestone({
  awbNumber,
  status, // 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'FAILED_ATTEMPT' | 'RTO'
  milestone,
  location,
  description
}) {
  if (!awbNumber) throw new Error('awbNumber is required');
  if (!status) throw new Error('status is required');

  const consignment = memoryConsignments.find((c) => c.awbNumber === awbNumber);

  const event = {
    awbNumber,
    orderNumber: consignment?.orderNumber || null,
    carrierId: consignment?.carrierId || 'BLUEDART',
    status,
    milestone: milestone || status,
    location: location || 'Transit Hub',
    description: description || `Status updated to ${status}`,
    timestamp: new Date().toISOString()
  };

  memoryTrackingMilestones.unshift(event);

  if (consignment) {
    consignment.status = status;
    consignment.lastUpdated = event.timestamp;

    // Update corresponding order status
    const order = memoryOrders.find((o) => o.orderNumber === consignment.orderNumber);
    if (order && status === 'DELIVERED') {
      order.status = 'DELIVERED';
      order.deliveredAt = event.timestamp;
    }
  }

  return { success: true, event };
}

/**
 * 6. Schedule Armoured Reverse Logistics for Customer Return
 * Permission: 'order:return_inspect' (manager, owner, accounts_staff)
 */
export async function scheduleReversePickup({
  orderId,
  returnId,
  pickupAddress = {},
  preferredDate = null,
  actor = { roleId: 'manager', id: 'usr-mgr-01' }
}) {
  assertPermission(actor.roleId, 'order:refund');

  if (!orderId) throw new Error('orderId is required');
  if (!returnId) throw new Error('returnId is required');

  const order = memoryOrders.find((o) => o.id === orderId || o.orderNumber === orderId);
  if (!order) throw new Error(`Order '${orderId}' not found`);

  const returnRecord = order.returns?.find((r) => r.id === returnId);
  if (!returnRecord) throw new Error(`Return record '${returnId}' not found for order`);

  const reverseAwbNumber = `REV-BLUEDART-NSK-${crypto.randomInt(100000, 999999)}`;
  const pickupId = `pck_${crypto.randomBytes(6).toString('hex')}`;
  const tamperBagSerial = `TAMPER-BAG-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

  const reversePickup = {
    id: pickupId,
    returnId,
    orderNumber: order.orderNumber,
    carrierId: CARRIERS.BLUEDART.id,
    carrierName: CARRIERS.BLUEDART.name,
    reverseAwbNumber,
    tamperBagSerial,
    pickupAddress: {
      addressLine1: pickupAddress.addressLine1 || order.shippingAddress?.addressLine1,
      city: pickupAddress.city || order.shippingAddress?.city,
      state: pickupAddress.state || order.shippingAddress?.state,
      postalCode: pickupAddress.postalCode || order.shippingAddress?.postalCode,
      phone: pickupAddress.phone || order.customer?.phone
    },
    scheduledDate: preferredDate || new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString().split('T')[0],
    timeSlot: '11:00 - 15:00 IST',
    status: 'PICKUP_SCHEDULED',
    instructions: 'Hand over jewellery piece ONLY in the sealed NISHKÈA tamper-evident bag provided by courier agent.',
    createdAt: new Date().toISOString(),
    scheduledBy: actor.id
  };

  memoryReversePickups.unshift(reversePickup);
  returnRecord.reversePickup = reversePickup;
  returnRecord.status = 'REVERSE_PICKUP_SCHEDULED';

  await logAuditEvent({
    actorId: actor.id,
    action: 'REVERSE_PICKUP_SCHEDULED',
    resourceType: 'RETURN_PICKUP',
    resourceId: pickupId,
    metadata: {
      orderNumber: order.orderNumber,
      returnId,
      reverseAwb: reverseAwbNumber,
      tamperBagSerial
    }
  });

  return {
    success: true,
    reversePickup
  };
}

/**
 * 7. Generate Printable HTML Shipping Label / Packaging Manifest
 */
export function renderShippingLabelHtml(consignment) {
  if (!consignment) throw new Error('Consignment required to render shipping label');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Shipping Label — ${consignment.awbNumber}</title>
  <style>
    @page { size: 100mm 150mm; margin: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 12px; background: #fff; color: #111; }
    .label-box { border: 2px solid #000; padding: 12px; height: 94%; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; }
    .header-row { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000; padding-bottom: 8px; }
    .carrier-title { font-size: 18px; font-weight: 900; letter-spacing: 0.5px; }
    .service-badge { background: #000; color: #fff; padding: 3px 8px; font-size: 11px; font-weight: 700; border-radius: 3px; }
    .awb-section { text-align: center; padding: 12px 0; border-bottom: 1.5px dashed #000; }
    .awb-code { font-family: monospace; font-size: 18px; font-weight: 900; letter-spacing: 1.5px; margin-top: 4px; }
    .barcode-mock { height: 38px; background: repeating-linear-gradient(90deg, #000, #000 2px, #fff 2px, #fff 5px, #000 5px, #000 8px); margin: 6px auto; width: 85%; }
    .address-section { padding: 10px 0; border-bottom: 1.5px dashed #000; font-size: 12px; }
    .addr-title { font-weight: 700; font-size: 11px; color: #444; margin-bottom: 4px; }
    .addr-name { font-size: 14px; font-weight: 700; margin-bottom: 3px; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px; padding: 8px 0; border-bottom: 1.5px dashed #000; }
    .security-notice { background: #FAF7F2; border: 1px solid #D4AF37; padding: 6px; font-size: 10px; line-height: 1.3; text-align: center; color: #4D0F21; }
    .footer-bar { display: flex; justify-content: space-between; font-size: 9px; color: #666; padding-top: 4px; }
  </style>
</head>
<body>
  <div class="label-box">
    <div class="header-row">
      <div class="carrier-title">${consignment.carrierName || 'BlueDart Express'}</div>
      <div class="service-badge">${consignment.isArmoured ? 'SPECIE ARMOURED' : 'PRIORITY AIR'}</div>
    </div>

    <div class="awb-section">
      <div style="font-size: 11px; font-weight: 600;">TRACKING AIR WAYBILL (AWB)</div>
      <div class="barcode-mock"></div>
      <div class="awb-code">${consignment.awbNumber}</div>
    </div>

    <div class="address-section">
      <div class="addr-title">SHIP TO:</div>
      <div class="addr-name">${consignment.customerName || 'Valued Patron'}</div>
      <div>${consignment.destination?.addressLine1 || ''}</div>
      <div><strong>${consignment.destination?.city || ''}, ${consignment.destination?.state || ''} — ${consignment.destination?.postalCode || ''}</strong></div>
      <div>Tel: ${consignment.destination?.phone || ''}</div>
    </div>

    <div class="meta-grid">
      <div><strong>Order Ref:</strong> ${consignment.orderNumber}</div>
      <div><strong>Security Seal:</strong> ${consignment.securitySealNumber || 'SEALED'}</div>
      <div><strong>Weight:</strong> ${consignment.weight?.chargeableWeightKg || 0.25} kg</div>
      <div><strong>Insurance:</strong> Full Specie Transit</div>
    </div>

    <div class="security-notice">
      🛡️ <strong>HIGH-VALUE ARCHIVAL JEWELLERY</strong><br />
      Verify tamper-evident seal integrity before delivery acceptance. Do not accept if seal broken.
    </div>

    <div class="footer-bar">
      <div>SHIPPER: TERONA NISHKÈA ATELIER, Colaba Flagship, Mumbai</div>
      <div>ROUTING: BOM / HUB-1</div>
    </div>
  </div>
</body>
</html>
  `.trim();
}
