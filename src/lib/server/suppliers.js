/**
 * NISHKÈA Supplier Directory, Purchase Order Approvals & Partial Receipts Engine — Node 9
 *
 * Implements:
 * 1. Supplier Directory with MOQs, lead times, and catalogue mapping
 * 2. Multi-tier Purchase Order approval workflows with high-value threshold gating
 * 3. Partial Goods Receipts with strict reconciliation:
 *    Ordered = Received + Remaining Pending; Net Accepted = Received - Returned
 * 4. Zero over-receipt protection: Received <= Ordered
 * 5. Bounded vendor returns: Returned <= Received
 * 6. Transactional inventory integration: Goods receipt creates FIFO batches and signed movements
 * 7. Server-side RBAC & Supplier Cost Isolation per AGENTS.md
 */

import crypto from 'crypto';
import { createGoodsReceipt, memoryMovements, memoryBatches } from './inventory.js';
import { checkPermission, logAuditEvent } from './permissions.js';

export const SUPPLIER_CONFIG = {
  highValueApprovalThresholdMinor: 10000000, // ₹1,00,000.00 (in paise)
  defaultCurrency: 'INR'
};

// In-Memory Master Suppliers Directory
export let memorySuppliers = [
  {
    id: 'sup-jpr-01',
    code: 'SUP-JPR-01',
    name: 'Jaipur Royal Filigree Guild',
    contactPerson: 'Rajeshwar Singh',
    email: 'contact@jaipurfiligree.in',
    phone: '+91 94140 12345',
    city: 'Jaipur',
    state: 'Rajasthan',
    leadTimeDays: 14,
    paymentTerms: 'Net 30',
    status: 'ACTIVE',
    notes: 'Primary artisan partner for 18k micron-plated brass chandeliers, pearls, and royal Kundan work.',
    products: [
      { variantId: 'NSK-EAR-001-GLD', supplierSku: 'JPR-EAR-FIL-01', unitCostMinor: 85000, moq: 20 },
      { variantId: 'NSK-EAR-001-SLV', supplierSku: 'JPR-EAR-FIL-02', unitCostMinor: 85000, moq: 20 },
      { variantId: 'NSK-NOS-005-PRS', supplierSku: 'JPR-NOS-NTH-05', unitCostMinor: 58000, moq: 25 }
    ]
  },
  {
    id: 'sup-sur-02',
    code: 'SUP-SUR-02',
    name: 'Surat Precision Zirconia Atelier',
    contactPerson: 'Ketan Shah',
    email: 'k.shah@suratzirconia.com',
    phone: '+91 98251 67890',
    city: 'Surat',
    state: 'Gujarat',
    leadTimeDays: 10,
    paymentTerms: 'Net 15',
    status: 'ACTIVE',
    notes: 'Precision stone-setting and comfort-fit cast brass alloys for solitaire and sculpted bands.',
    products: [
      { variantId: 'NSK-RNG-002-SZ6', supplierSku: 'SUR-RNG-MAR-06', unitCostMinor: 62000, moq: 30 },
      { variantId: 'NSK-RNG-002-SZ7', supplierSku: 'SUR-RNG-MAR-07', unitCostMinor: 62000, moq: 30 },
      { variantId: 'NSK-RNG-007-SZ7', supplierSku: 'SUR-RNG-WAV-07', unitCostMinor: 52000, moq: 25 }
    ]
  },
  {
    id: 'sup-blr-03',
    code: 'SUP-BLR-03',
    name: 'Silk & Velvet Handloom Guild',
    contactPerson: 'Meenakshi Iyer',
    email: 'meenakshi@silkhandlooms.co.in',
    phone: '+91 98860 34567',
    city: 'Bengaluru',
    state: 'Karnataka',
    leadTimeDays: 12,
    paymentTerms: '50% Advance / Net 15',
    status: 'ACTIVE',
    notes: 'Grade 6A Mulberry silk scrunchies and French plush velvet bands with botanical natural dyes.',
    products: [
      { variantId: 'NSK-HAR-004-IVR', supplierSku: 'BLR-HAR-SCR-IVR', unitCostMinor: 48000, moq: 50 },
      { variantId: 'NSK-HAR-004-BRG', supplierSku: 'BLR-HAR-SCR-BRG', unitCostMinor: 48000, moq: 50 },
      { variantId: 'NSK-NCK-003-BUR', supplierSku: 'BLR-NCK-VEL-BUR', unitCostMinor: 110000, moq: 15 }
    ]
  },
  {
    id: 'sup-bom-04',
    code: 'SUP-BOM-04',
    name: 'Mumbai Micro-Pavé Metals',
    contactPerson: 'Deepak Mehta',
    email: 'deepak@mumbaipave.com',
    phone: '+91 98200 45678',
    city: 'Mumbai',
    state: 'Maharashtra',
    leadTimeDays: 7,
    paymentTerms: 'Net 30',
    status: 'ACTIVE',
    notes: 'Sterling silver and 18k yellow gold vermeil Huggie hoops and paperclip chains.',
    products: [
      { variantId: 'NSK-EAR-006-GLD', supplierSku: 'BOM-EAR-HUG-GLD', unitCostMinor: 42000, moq: 40 },
      { variantId: 'NSK-EAR-006-SLV', supplierSku: 'BOM-EAR-HUG-SLV', unitCostMinor: 42000, moq: 40 },
      { variantId: 'NSK-NCK-008-45C', supplierSku: 'BOM-NCK-SOL-45C', unitCostMinor: 95000, moq: 25 }
    ]
  }
];

// In-Memory Purchase Orders Store
export let memoryPurchaseOrders = [
  {
    id: 'po-2026-0041',
    poNumber: 'PO-2026-0041',
    supplierId: 'sup-jpr-01',
    supplierName: 'Jaipur Royal Filigree Guild',
    status: 'PARTIALLY_RECEIVED',
    totalCostMinor: 4250000, // ₹42,500.00
    currency: 'INR',
    createdBy: 'usr-inv-01',
    approvedBy: 'usr-mgr-01',
    approvedAt: '2026-10-10T11:00:00Z',
    approvalNotes: 'Approved for late autumn collection restocking',
    expectedDeliveryDate: '2026-10-24',
    lines: [
      {
        id: 'pol-01',
        variantId: 'NSK-EAR-001-GLD',
        designName: 'Aurelia Filigree Chandelier Drops (Antique Gold)',
        orderedQuantity: 50,
        receivedQuantity: 30, // 30 received, 20 pending
        returnedQuantity: 0,
        unitCostMinor: 85000,
        lineTotalMinor: 4250000
      }
    ],
    receipts: [
      {
        receiptId: 'rcpt-01',
        batchId: 'BAT-202610-01',
        batchReference: 'BATCH-202610-A',
        quantity: 30,
        receivedDate: '2026-10-14',
        receivedBy: 'usr-inv-01'
      }
    ],
    returns: [],
    createdAt: '2026-10-10T10:00:00Z',
    updatedAt: '2026-10-14T14:30:00Z'
  },
  {
    id: 'po-2026-0042',
    poNumber: 'PO-2026-0042',
    supplierId: 'sup-sur-02',
    supplierName: 'Surat Precision Zirconia Atelier',
    status: 'PENDING_APPROVAL',
    totalCostMinor: 2480000, // ₹24,800.00
    currency: 'INR',
    createdBy: 'usr-inv-01',
    approvedBy: null,
    approvedAt: null,
    approvalNotes: null,
    expectedDeliveryDate: '2026-10-28',
    lines: [
      {
        id: 'pol-02',
        variantId: 'NSK-RNG-002-SZ7',
        designName: 'Celeste Marquise Solitaire Band (US 7)',
        orderedQuantity: 40,
        receivedQuantity: 0,
        returnedQuantity: 0,
        unitCostMinor: 62000,
        lineTotalMinor: 2480000
      }
    ],
    receipts: [],
    returns: [],
    createdAt: '2026-10-18T16:00:00Z',
    updatedAt: '2026-10-18T16:00:00Z'
  },
  {
    id: 'po-2026-0043',
    poNumber: 'PO-2026-0043',
    supplierId: 'sup-blr-03',
    supplierName: 'Silk & Velvet Handloom Guild',
    status: 'FULFILLED',
    totalCostMinor: 2880000, // ₹28,800.00
    currency: 'INR',
    createdBy: 'usr-inv-01',
    approvedBy: 'usr-mgr-01',
    approvedAt: '2026-10-01T09:30:00Z',
    approvalNotes: 'Approved seasonal hair accessories restock',
    expectedDeliveryDate: '2026-10-15',
    lines: [
      {
        id: 'pol-03',
        variantId: 'NSK-HAR-004-IVR',
        designName: 'Seraphina Silk Scrunchie & Clip Set (Warm Ivory)',
        orderedQuantity: 60,
        receivedQuantity: 60, // 60 received
        returnedQuantity: 2,  // 2 returned defective
        unitCostMinor: 48000,
        lineTotalMinor: 2880000
      }
    ],
    receipts: [
      {
        receiptId: 'rcpt-02',
        batchId: 'BAT-202610-03',
        batchReference: 'BATCH-202610-C',
        quantity: 60,
        receivedDate: '2026-10-12',
        receivedBy: 'usr-inv-01'
      }
    ],
    returns: [
      {
        returnId: 'sup-ret-01',
        variantId: 'NSK-HAR-004-IVR',
        quantity: 2,
        reason: 'DEFECTIVE_WEAVE',
        date: '2026-10-13',
        returnedBy: 'usr-inv-01'
      }
    ],
    createdAt: '2026-10-01T09:00:00Z',
    updatedAt: '2026-10-13T16:00:00Z'
  }
];

/**
 * 1. Get Suppliers Directory with Cost Redaction Gate
 */
export function getSuppliersList({ user = null } = {}) {
  // Check if caller is authorized to view wholesale costs
  const canViewCost = user ? checkPermission(user, 'cost:view').allowed : false;

  return memorySuppliers.map((s) => ({
    id: s.id,
    code: s.code,
    name: s.name,
    contactPerson: s.contactPerson,
    email: s.email,
    phone: s.phone,
    city: s.city,
    state: s.state,
    leadTimeDays: s.leadTimeDays,
    paymentTerms: s.paymentTerms,
    status: s.status,
    notes: s.notes,
    products: s.products.map((p) => ({
      variantId: p.variantId,
      supplierSku: p.supplierSku,
      moq: p.moq,
      unitCostMinor: canViewCost ? p.unitCostMinor : null
    }))
  }));
}

/**
 * 2. Get Single Supplier by ID or Code
 */
export function getSupplierById(supplierId, { user = null } = {}) {
  const s = memorySuppliers.find((sup) => sup.id === supplierId || sup.code === supplierId);
  if (!s) return null;

  const canViewCost = user ? checkPermission(user, 'cost:view').allowed : false;

  return {
    ...s,
    products: s.products.map((p) => ({
      ...p,
      unitCostMinor: canViewCost ? p.unitCostMinor : null
    }))
  };
}

/**
 * 3. Create Purchase Order with MOQ Validation & Approval Gating
 */
export async function createPurchaseOrder({
  supplierId,
  lines,
  expectedDeliveryDate,
  notes = '',
  actorId = 'usr-inv-01',
  user = null
}) {
  if (!supplierId) throw new Error('supplierId is required');
  const supplier = memorySuppliers.find((s) => s.id === supplierId || s.code === supplierId);
  if (!supplier) throw new Error(`Supplier '${supplierId}' not found in directory`);

  if (!Array.isArray(lines) || lines.length === 0) {
    throw new Error('Purchase order must contain at least one line item');
  }

  let totalCostMinor = 0;
  const validatedLines = [];

  for (const line of lines) {
    const qty = parseInt(line.quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      throw new Error(`Quantity must be a positive integer for variant ${line.variantId}`);
    }

    // Lookup supplier product mapping
    const supplierProduct = supplier.products.find((p) => p.variantId === line.variantId);
    if (!supplierProduct) {
      throw new Error(`Variant '${line.variantId}' is not contracted with supplier '${supplier.name}'`);
    }

    // Enforce Minimum Order Quantity (MOQ)
    if (qty < supplierProduct.moq) {
      throw new Error(
        `Quantity (${qty}) for '${line.variantId}' is below supplier MOQ (${supplierProduct.moq})`
      );
    }

    const unitCostMinor = supplierProduct.unitCostMinor;
    const lineTotalMinor = unitCostMinor * qty;
    totalCostMinor += lineTotalMinor;

    validatedLines.push({
      id: `pol-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      variantId: line.variantId,
      designName: line.designName || line.variantId,
      orderedQuantity: qty,
      receivedQuantity: 0,
      returnedQuantity: 0,
      unitCostMinor,
      lineTotalMinor
    });
  }

  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const poNumber = `PO-${new Date().getFullYear()}-${randomSuffix}`;
  const poId = `po-${Date.now().toString(36)}-${crypto.randomBytes(2).toString('hex')}`;

  // Approval Rule:
  // POs >= high-value threshold require explicit Manager/Owner approval.
  // Smaller POs from Manager/Owner can be auto-approved; from staff start in PENDING_APPROVAL.
  const isHighValue = totalCostMinor >= SUPPLIER_CONFIG.highValueApprovalThresholdMinor;
  const isManagerOrOwner = user && (user.roleId === 'owner' || user.roleId === 'manager');

  let initialStatus = 'PENDING_APPROVAL';
  let approvedBy = null;
  let approvedAt = null;

  if (!isHighValue && isManagerOrOwner) {
    initialStatus = 'APPROVED';
    approvedBy = user.id || actorId;
    approvedAt = new Date().toISOString();
  }

  const newPO = {
    id: poId,
    poNumber,
    supplierId: supplier.id,
    supplierName: supplier.name,
    status: initialStatus,
    totalCostMinor,
    currency: SUPPLIER_CONFIG.defaultCurrency,
    createdBy: actorId,
    approvedBy,
    approvedAt,
    approvalNotes: notes || null,
    expectedDeliveryDate: expectedDeliveryDate || new Date(Date.now() + supplier.leadTimeDays * 86400000).toISOString().slice(0, 10),
    lines: validatedLines,
    receipts: [],
    returns: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  memoryPurchaseOrders.unshift(newPO);

  await logAuditEvent({
    actorId,
    action: 'PURCHASE_ORDER_CREATED',
    resourceType: 'PURCHASE_ORDER',
    resourceId: poId,
    metadata: {
      poNumber,
      supplierId: supplier.id,
      totalCostMinor,
      status: initialStatus,
      isHighValue
    }
  });

  return {
    success: true,
    purchaseOrder: newPO,
    requiresApproval: initialStatus === 'PENDING_APPROVAL'
  };
}

/**
 * 4. Approve Purchase Order (Restricted to Manager/Owner)
 */
export async function approvePurchaseOrder({
  poId,
  user,
  approvalNotes = 'Approved for procurement',
  actorId = 'usr-mgr-01'
}) {
  if (!poId) throw new Error('poId is required');

  // RBAC Permission Check
  if (user) {
    const isPermitted = user.roleId === 'owner' || user.roleId === 'manager';
    if (!isPermitted) {
      const err = new Error(`Access Denied: Only Managers and Owners can approve purchase orders. Role: '${user.roleId}'`);
      err.statusCode = 403;
      throw err;
    }
  }

  const po = memoryPurchaseOrders.find((p) => p.id === poId || p.poNumber === poId);
  if (!po) throw new Error(`Purchase order '${poId}' not found`);

  if (po.status === 'APPROVED' || po.status === 'PARTIALLY_RECEIVED' || po.status === 'FULFILLED') {
    return { success: true, purchaseOrder: po, message: 'Purchase order is already approved' };
  }

  if (po.status === 'CANCELLED') {
    throw new Error(`Cannot approve cancelled purchase order '${po.poNumber}'`);
  }

  po.status = 'APPROVED';
  po.approvedBy = user?.id || actorId;
  po.approvedAt = new Date().toISOString();
  po.approvalNotes = approvalNotes;
  po.updatedAt = new Date().toISOString();

  await logAuditEvent({
    actorId: user?.id || actorId,
    action: 'PURCHASE_ORDER_APPROVED',
    resourceType: 'PURCHASE_ORDER',
    resourceId: po.id,
    metadata: { poNumber: po.poNumber, totalCostMinor: po.totalCostMinor, approvalNotes }
  });

  return {
    success: true,
    purchaseOrder: po
  };
}

/**
 * 5. Receive Partial or Full Goods Shipment against Approved PO
 * Enforces quantity bounds: Received <= Ordered.
 * Integrates directly with Transactional Inventory Ledger (createGoodsReceipt).
 */
export async function receivePurchaseOrderShipment({
  poId,
  items,
  batchReference,
  receivedDate = new Date().toISOString().slice(0, 10),
  actorId = 'usr-inv-01',
  user = null
}) {
  if (!poId) throw new Error('poId is required');
  const po = memoryPurchaseOrders.find((p) => p.id === poId || p.poNumber === poId);
  if (!po) throw new Error(`Purchase order '${poId}' not found`);

  // Hard Gate: Cannot receive goods against an unapproved PO
  if (po.status !== 'APPROVED' && po.status !== 'PARTIALLY_RECEIVED') {
    throw new Error(
      `Cannot receive goods against purchase order '${po.poNumber}' in status '${po.status}'. PO must be APPROVED first.`
    );
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Receipt must specify at least one item quantity');
  }

  const generatedBatchRef = batchReference || `BATCH-${po.poNumber}-${Date.now().toString(36).slice(-4).toUpperCase()}`;
  const receiptRecords = [];

  for (const item of items) {
    const qty = parseInt(item.quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      throw new Error(`Receipt quantity must be positive for ${item.variantId}`);
    }

    const poLine = po.lines.find((l) => l.variantId === item.variantId);
    if (!poLine) {
      throw new Error(`Variant '${item.variantId}' is not part of purchase order '${po.poNumber}'`);
    }

    // Zero Over-Receipt Protection: Received cannot exceed Ordered
    const remainingOrdered = poLine.orderedQuantity - poLine.receivedQuantity;
    if (qty > remainingOrdered) {
      throw new Error(
        `Receipt quantity (${qty}) exceeds remaining ordered balance (${remainingOrdered}) for '${item.variantId}'. Ordered: ${poLine.orderedQuantity}, Previously Received: ${poLine.receivedQuantity}`
      );
    }

    // Update PO Line
    poLine.receivedQuantity += qty;

    // Transactional Inventory Integration:
    // Append batch to stock ledger and record signed RECEIPT movement
    const invReceipt = await createGoodsReceipt({
      variantId: item.variantId,
      batchReference: generatedBatchRef,
      quantity: qty,
      unitCostMinor: poLine.unitCostMinor,
      receivedDate,
      actorId: user?.id || actorId,
      sourceRef: po.poNumber
    });

    const receiptEntry = {
      receiptId: `rcpt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      batchId: invReceipt.batch.id,
      batchReference: generatedBatchRef,
      variantId: item.variantId,
      quantity: qty,
      receivedDate,
      receivedBy: user?.id || actorId
    };

    po.receipts.push(receiptEntry);
    receiptRecords.push(receiptEntry);
  }

  // Reconcile Overall PO Status:
  // FULFILLED if all lines completely received; PARTIALLY_RECEIVED otherwise
  const totalOrdered = po.lines.reduce((sum, l) => sum + l.orderedQuantity, 0);
  const totalReceived = po.lines.reduce((sum, l) => sum + l.receivedQuantity, 0);

  if (totalReceived >= totalOrdered) {
    po.status = 'FULFILLED';
  } else {
    po.status = 'PARTIALLY_RECEIVED';
  }

  po.updatedAt = new Date().toISOString();

  await logAuditEvent({
    actorId: user?.id || actorId,
    action: 'PURCHASE_ORDER_GOODS_RECEIVED',
    resourceType: 'PURCHASE_ORDER',
    resourceId: po.id,
    metadata: {
      poNumber: po.poNumber,
      totalOrdered,
      totalReceived,
      status: po.status,
      receipts: receiptRecords
    }
  });

  return {
    success: true,
    purchaseOrder: po,
    receiptRecords,
    reconciliation: {
      totalOrdered,
      totalReceived,
      remainingPending: totalOrdered - totalReceived,
      status: po.status
    }
  };
}

/**
 * 6. Return Defective / Non-Conforming Items to Supplier
 * Enforces bounded rule: Returned <= Received.
 * Decrements inventory batches and creates signed SUPPLIER_RETURN movement.
 */
export async function returnPurchaseOrderItems({
  poId,
  items,
  reason = 'DEFECTIVE_OR_DAMAGED',
  notes = '',
  actorId = 'usr-inv-01',
  user = null
}) {
  if (!poId) throw new Error('poId is required');
  const po = memoryPurchaseOrders.find((p) => p.id === poId || p.poNumber === poId);
  if (!po) throw new Error(`Purchase order '${poId}' not found`);

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Return must specify at least one item quantity');
  }

  const returnRecords = [];

  for (const item of items) {
    const qty = parseInt(item.quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      throw new Error(`Return quantity must be positive for ${item.variantId}`);
    }

    const poLine = po.lines.find((l) => l.variantId === item.variantId);
    if (!poLine) {
      throw new Error(`Variant '${item.variantId}' is not part of purchase order '${po.poNumber}'`);
    }

    // Bounded Validation: Cannot return more than currently accepted received units
    const maxEligibleToReturn = poLine.receivedQuantity - poLine.returnedQuantity;
    if (qty > maxEligibleToReturn) {
      throw new Error(
        `Return quantity (${qty}) exceeds eligible received balance (${maxEligibleToReturn}) for '${item.variantId}'. Total Received: ${poLine.receivedQuantity}, Previously Returned: ${poLine.returnedQuantity}`
      );
    }

    poLine.returnedQuantity += qty;

    // Transactional Inventory Integration:
    // Deduct physical inventory from latest batch of this variant
    const targetBatch = memoryBatches.find((b) => b.variantId === item.variantId && b.currentQuantity >= qty);
    if (targetBatch) {
      targetBatch.currentQuantity -= qty;
    }

    // Append signed negative movement
    memoryMovements.push({
      id: memoryMovements.length + 1,
      batchId: targetBatch ? targetBatch.id : 'BAT-SUP-RETURN',
      variantId: item.variantId,
      quantity: -qty, // Signed negative return
      movementType: 'SUPPLIER_RETURN',
      sourceRef: `VRET-${po.poNumber}`,
      actorId: user?.id || actorId,
      createdAt: new Date().toISOString()
    });

    const returnEntry = {
      returnId: `ret-sup-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      variantId: item.variantId,
      quantity: qty,
      reason,
      notes,
      date: new Date().toISOString().slice(0, 10),
      returnedBy: user?.id || actorId
    };

    po.returns.push(returnEntry);
    returnRecords.push(returnEntry);
  }

  po.updatedAt = new Date().toISOString();

  await logAuditEvent({
    actorId: user?.id || actorId,
    action: 'PURCHASE_ORDER_SUPPLIER_RETURN',
    resourceType: 'PURCHASE_ORDER',
    resourceId: po.id,
    metadata: {
      poNumber: po.poNumber,
      returns: returnRecords
    }
  });

  const totalOrdered = po.lines.reduce((sum, l) => sum + l.orderedQuantity, 0);
  const totalReceived = po.lines.reduce((sum, l) => sum + l.receivedQuantity, 0);
  const totalReturned = po.lines.reduce((sum, l) => sum + l.returnedQuantity, 0);

  return {
    success: true,
    purchaseOrder: po,
    returnRecords,
    reconciliation: {
      totalOrdered,
      totalReceived,
      totalReturned,
      netAcceptedOnHand: totalReceived - totalReturned,
      remainingPending: totalOrdered - totalReceived
    }
  };
}

/**
 * 7. List Purchase Orders with RBAC Cost Redaction
 */
export function getPurchaseOrdersList({ user = null, status = null, supplierId = null } = {}) {
  const canViewCost = user ? checkPermission(user, 'cost:view').allowed : false;

  let list = [...memoryPurchaseOrders];

  if (status) {
    list = list.filter((p) => p.status === status);
  }

  if (supplierId) {
    list = list.filter((p) => p.supplierId === supplierId);
  }

  return list.map((po) => {
    const totalOrdered = po.lines.reduce((sum, l) => sum + l.orderedQuantity, 0);
    const totalReceived = po.lines.reduce((sum, l) => sum + l.receivedQuantity, 0);
    const totalReturned = po.lines.reduce((sum, l) => sum + l.returnedQuantity, 0);

    return {
      id: po.id,
      poNumber: po.poNumber,
      supplierId: po.supplierId,
      supplierName: po.supplierName,
      status: po.status,
      totalCostMinor: canViewCost ? po.totalCostMinor : null,
      currency: po.currency,
      createdBy: po.createdBy,
      approvedBy: po.approvedBy,
      approvedAt: po.approvedAt,
      approvalNotes: po.approvalNotes,
      expectedDeliveryDate: po.expectedDeliveryDate,
      linesCount: po.lines.length,
      lines: po.lines.map((l) => ({
        id: l.id,
        variantId: l.variantId,
        designName: l.designName,
        orderedQuantity: l.orderedQuantity,
        receivedQuantity: l.receivedQuantity,
        returnedQuantity: l.returnedQuantity,
        netAcceptedQuantity: l.receivedQuantity - l.returnedQuantity,
        remainingToReceive: l.orderedQuantity - l.receivedQuantity,
        unitCostMinor: canViewCost ? l.unitCostMinor : null,
        lineTotalMinor: canViewCost ? l.lineTotalMinor : null
      })),
      reconciliation: {
        totalOrdered,
        totalReceived,
        totalReturned,
        netAcceptedOnHand: totalReceived - totalReturned,
        remainingPending: totalOrdered - totalReceived,
        percentReceived: totalOrdered > 0 ? Math.round((totalReceived / totalOrdered) * 100) : 0
      },
      createdAt: po.createdAt,
      updatedAt: po.updatedAt
    };
  });
}

/**
 * 8. Get Purchase Order Details by ID or PO Number
 */
export function getPurchaseOrderById(poId, { user = null } = {}) {
  const po = memoryPurchaseOrders.find((p) => p.id === poId || p.poNumber === poId);
  if (!po) return null;

  const canViewCost = user ? checkPermission(user, 'cost:view').allowed : false;

  const totalOrdered = po.lines.reduce((sum, l) => sum + l.orderedQuantity, 0);
  const totalReceived = po.lines.reduce((sum, l) => sum + l.receivedQuantity, 0);
  const totalReturned = po.lines.reduce((sum, l) => sum + l.returnedQuantity, 0);

  return {
    ...po,
    totalCostMinor: canViewCost ? po.totalCostMinor : null,
    lines: po.lines.map((l) => ({
      ...l,
      unitCostMinor: canViewCost ? l.unitCostMinor : null,
      lineTotalMinor: canViewCost ? l.lineTotalMinor : null,
      netAcceptedQuantity: l.receivedQuantity - l.returnedQuantity,
      remainingToReceive: l.orderedQuantity - l.receivedQuantity
    })),
    reconciliation: {
      totalOrdered,
      totalReceived,
      totalReturned,
      netAcceptedOnHand: totalReceived - totalReturned,
      remainingPending: totalOrdered - totalReceived,
      percentReceived: totalOrdered > 0 ? Math.round((totalReceived / totalOrdered) * 100) : 0
    }
  };
}
