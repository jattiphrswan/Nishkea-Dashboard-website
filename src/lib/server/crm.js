/**
 * NISHKÈA CRM, Customer Segmentation, Sales Pipeline & Team Tasks Engine — Node 10
 *
 * Implements:
 * 1. Customer profiles with Retail vs Wholesale segmentation and separate marketing consent.
 * 2. Lead sales pipeline (ENQUIRY -> QUALIFIED -> QUOTATION -> WON / LOST) with lost-reason validation.
 * 3. Follow-up scheduling and overdue tracking.
 * 4. Role-based scoping: sales_support scoped to assigned records; managers/owners access all.
 * 5. Team task recurrence engine: generates exactly once per scheduled occurrence (idempotent).
 * 6. Support ticket tracking with order linking and resolution workflow.
 */

import crypto from 'crypto';
import { assertPermission, logAuditEvent } from './permissions.js';

export const CRM_STAGES = ['ENQUIRY', 'QUALIFIED', 'QUOTATION', 'WON', 'LOST'];
export const CUSTOMER_SEGMENTS = ['RETAIL', 'WHOLESALE'];
export const TASK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
export const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE'];
export const TASK_RECURRENCES = ['DAILY', 'WEEKLY', 'MONTHLY'];

// In-Memory CRM Store (Active when live DB URL is pending)
export let memoryCustomers = [
  {
    id: 'cust-101',
    name: 'Aditi Sharma',
    email: 'aditi.sharma@example.com',
    phone: '+91 98765 43210',
    segment: 'RETAIL',
    companyName: null,
    gstNumber: null,
    marketingConsent: true,
    totalOrders: 3,
    totalSpendMinor: 589700, // ₹5,897.00
    notes: 'Prefers antique gold filigree and delicate pearls. VIP festive retail buyer.',
    createdAt: '2026-09-15T10:00:00Z',
    updatedAt: '2026-10-18T10:30:00Z'
  },
  {
    id: 'cust-102',
    name: 'Meera Joshi',
    email: 'meera.j@auraluxury.in',
    phone: '+91 98220 11223',
    segment: 'WHOLESALE',
    companyName: 'Aura Luxury Boutiques Pvt Ltd',
    gstNumber: '27AABCU9603R1ZM',
    marketingConsent: true,
    totalOrders: 5,
    totalSpendMinor: 14500000, // ₹1,45,000.00
    notes: 'South Mumbai boutique buyer. Net 30 wholesale terms. High MOQ buyer.',
    createdAt: '2026-08-10T12:00:00Z',
    updatedAt: '2026-10-19T14:15:00Z'
  },
  {
    id: 'cust-103',
    name: 'Priya Sundaram',
    email: 'priya.s@example.com',
    phone: '+91 91234 56789',
    segment: 'RETAIL',
    companyName: null,
    gstNumber: null,
    marketingConsent: false,
    totalOrders: 2,
    totalSpendMinor: 279800, // ₹2,798.00
    notes: 'Chennai client. Likes solitaire marquise bands and emerald accents.',
    createdAt: '2026-09-28T08:30:00Z',
    updatedAt: '2026-10-20T11:00:00Z'
  }
];

export let memoryLeads = [
  {
    id: 'lead-101',
    title: 'Bridal Trousseau Chandelier & Choker Ensemble',
    customerId: 'cust-101',
    customerName: 'Aditi Sharma',
    customerEmail: 'aditi.sharma@example.com',
    customerPhone: '+91 98765 43210',
    segment: 'RETAIL',
    leadSource: 'CONCIERGE_AI',
    stage: 'QUALIFIED',
    lostReason: null,
    estimatedValueMinor: 12000000, // ₹1,20,000.00
    currency: 'INR',
    ownerId: 'usr-sal-01',
    ownerName: 'Sales Representative',
    nextFollowUpDate: '2026-10-22',
    notes: 'Consulted via AI Concierge for November wedding. Requested private showroom slot.',
    history: [
      { stage: 'ENQUIRY', changedAt: '2026-10-15T10:00:00Z', actorId: 'system', note: 'AI Concierge capture' },
      { stage: 'QUALIFIED', changedAt: '2026-10-17T14:00:00Z', actorId: 'usr-sal-01', note: 'Budget verified' }
    ],
    createdAt: '2026-10-15T10:00:00Z',
    updatedAt: '2026-10-17T14:00:00Z'
  },
  {
    id: 'lead-102',
    title: 'Diwali Festive Boutique Consignment (50 units)',
    customerId: 'cust-102',
    customerName: 'Meera Joshi',
    customerEmail: 'meera.j@auraluxury.in',
    customerPhone: '+91 98220 11223',
    segment: 'WHOLESALE',
    leadSource: 'WALK_IN',
    stage: 'QUOTATION',
    lostReason: null,
    estimatedValueMinor: 45000000, // ₹4,50,000.00
    currency: 'INR',
    ownerId: 'usr-mgr-01',
    ownerName: 'Operations Manager',
    nextFollowUpDate: '2026-10-24',
    notes: 'Quotation sent for 50 pieces across earrings and cuffs. Awaiting PO approval.',
    history: [
      { stage: 'ENQUIRY', changedAt: '2026-10-10T11:00:00Z', actorId: 'usr-mgr-01', note: 'Store visit' },
      { stage: 'QUALIFIED', changedAt: '2026-10-12T16:00:00Z', actorId: 'usr-mgr-01', note: 'GST & credit verified' },
      { stage: 'QUOTATION', changedAt: '2026-10-18T09:30:00Z', actorId: 'usr-mgr-01', note: 'Commercial quote Q-2026-18' }
    ],
    createdAt: '2026-10-10T11:00:00Z',
    updatedAt: '2026-10-18T09:30:00Z'
  },
  {
    id: 'lead-103',
    title: 'Bespoke Emerald Choker Custom Order',
    customerId: 'cust-103',
    customerName: 'Priya Sundaram',
    customerEmail: 'priya.s@example.com',
    customerPhone: '+91 91234 56789',
    segment: 'RETAIL',
    leadSource: 'WEBSITE',
    stage: 'WON',
    lostReason: null,
    estimatedValueMinor: 4500000, // ₹45,000.00
    currency: 'INR',
    ownerId: 'usr-sal-01',
    ownerName: 'Sales Representative',
    nextFollowUpDate: null,
    notes: 'Converted to confirmed order NSK-2026-1081.',
    history: [
      { stage: 'ENQUIRY', changedAt: '2026-10-16T12:00:00Z', actorId: 'system', note: 'Web consultation' },
      { stage: 'WON', changedAt: '2026-10-18T16:45:00Z', actorId: 'usr-sal-01', note: 'Payment received' }
    ],
    createdAt: '2026-10-16T12:00:00Z',
    updatedAt: '2026-10-18T16:45:00Z'
  },
  {
    id: 'lead-104',
    title: 'Corporate Festive Souvenir Enamel Brooches (200 pcs)',
    customerId: null,
    customerName: 'Rohit Khandelwal',
    customerEmail: 'rohit@techcorp.in',
    customerPhone: '+91 99887 76655',
    segment: 'WHOLESALE',
    leadSource: 'WHATSAPP_ENQUIRY',
    stage: 'LOST',
    lostReason: 'Client target budget was capped at ₹450 per unit; lowest handcrafted atelier unit cost starts at ₹1,200',
    estimatedValueMinor: 9000000,
    currency: 'INR',
    ownerId: 'usr-sal-01',
    ownerName: 'Sales Representative',
    nextFollowUpDate: null,
    notes: 'Cannot meet ultra-low budget without compromising artisan quality.',
    history: [
      { stage: 'ENQUIRY', changedAt: '2026-10-14T09:00:00Z', actorId: 'usr-sal-01', note: 'WhatsApp lead' },
      { stage: 'LOST', changedAt: '2026-10-15T15:00:00Z', actorId: 'usr-sal-01', note: 'Budget mismatch' }
    ],
    createdAt: '2026-10-14T09:00:00Z',
    updatedAt: '2026-10-15T15:00:00Z'
  }
];

export let memoryTasks = [
  {
    id: 'tsk-001',
    title: 'Conduct 30-Day Decision for Nocturne Velvet Choker',
    priority: 'HIGH',
    status: 'TODO',
    assignedTo: 'Collection Manager',
    assignedToUserId: 'usr-mgr-01',
    dueDate: '2026-10-20',
    linkedRecord: 'Review rev-001',
    recurrence: null,
    lastGeneratedDate: null,
    parentTaskId: null,
    createdAt: '2026-10-19T08:00:00Z',
    updatedAt: '2026-10-19T08:00:00Z'
  },
  {
    id: 'tsk-rec-01',
    title: 'Daily Physical Vault Morning Stock Count',
    priority: 'HIGH',
    status: 'TODO',
    assignedTo: 'Inventory Lead',
    assignedToUserId: 'usr-inv-01',
    dueDate: '2026-10-20',
    linkedRecord: 'Vault Operations',
    recurrence: 'DAILY',
    lastGeneratedDate: '2026-10-20',
    parentTaskId: null,
    createdAt: '2026-10-18T06:00:00Z',
    updatedAt: '2026-10-20T06:00:00Z'
  },
  {
    id: 'tsk-rec-02',
    title: 'Weekly Courier Dispatch & Exception Reconciliation',
    priority: 'MEDIUM',
    status: 'TODO',
    assignedTo: 'Operations Manager',
    assignedToUserId: 'usr-mgr-01',
    dueDate: '2026-10-14',
    linkedRecord: 'BlueDart Logistics',
    recurrence: 'WEEKLY',
    lastGeneratedDate: '2026-10-14',
    parentTaskId: null,
    createdAt: '2026-10-07T08:00:00Z',
    updatedAt: '2026-10-14T08:00:00Z'
  }
];

export let memorySupportTickets = [
  {
    id: 'tkt-001',
    ticketNumber: 'TKT-2026-001',
    customerName: 'Aditi Sharma',
    customerEmail: 'aditi.sharma@example.com',
    subject: 'Ring Size Exchange Guidance',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    category: 'RETURN_EXCHANGE',
    assignedTo: 'usr-sal-01',
    linkedOrderNumber: 'NSK-2026-1082',
    resolution: null,
    createdAt: '2026-10-19T11:00:00Z',
    updatedAt: '2026-10-19T14:30:00Z'
  }
];

/** Scope Helper: checks if user has manager or owner role */
function isElevatedStaff(user) {
  const role = user?.roleId?.toLowerCase();
  return role === 'manager' || role === 'owner';
}

/* =========================================================================
 * 1. CUSTOMERS MANAGEMENT
 * ========================================================================= */

export function getCustomersList({ user, segment, search }) {
  assertPermission(user, 'crm:view');

  let list = [...memoryCustomers];
  if (segment && segment !== 'ALL') {
    list = list.filter((c) => c.segment === segment);
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.companyName && c.companyName.toLowerCase().includes(q))
    );
  }
  return list;
}

export function getCustomerById(id, { user }) {
  assertPermission(user, 'crm:view');
  const customer = memoryCustomers.find((c) => c.id === id);
  if (!customer) throw new Error(`Customer with ID '${id}' not found.`);

  const relatedLeads = memoryLeads.filter((l) => l.customerId === id);
  return { ...customer, leads: relatedLeads };
}

export async function createCustomer({
  name,
  email,
  phone,
  segment = 'RETAIL',
  companyName = null,
  gstNumber = null,
  marketingConsent = false,
  notes = '',
  user
}) {
  assertPermission(user, 'crm:edit');

  if (!name || !email || !phone) {
    throw new Error('Customer name, valid email, and phone number are required.');
  }
  if (!CUSTOMER_SEGMENTS.includes(segment)) {
    throw new Error(`Invalid customer segment '${segment}'. Permitted: ${CUSTOMER_SEGMENTS.join(', ')}.`);
  }
  if (segment === 'WHOLESALE' && !companyName) {
    throw new Error('Registered company name is mandatory for wholesale customer accounts.');
  }

  // Duplicate contact review (by email or phone)
  const existing = memoryCustomers.find(
    (c) => c.email.toLowerCase() === email.toLowerCase() || c.phone.trim() === phone.trim()
  );
  if (existing) {
    throw new Error(`Duplicate contact detected: Customer '${existing.name}' already exists with email '${existing.email}' or phone '${existing.phone}'.`);
  }

  const newCustomer = {
    id: `cust-${Date.now().toString(36)}-${crypto.randomBytes(2).toString('hex')}`,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    phone: phone.trim(),
    segment,
    companyName: segment === 'WHOLESALE' ? (companyName || '').trim() : null,
    gstNumber: segment === 'WHOLESALE' ? (gstNumber || '').trim() : null,
    marketingConsent: Boolean(marketingConsent),
    totalOrders: 0,
    totalSpendMinor: 0,
    notes: (notes || '').trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  memoryCustomers.unshift(newCustomer);

  await logAuditEvent({
    actorId: user?.id || 'staff',
    action: 'CRM_CUSTOMER_CREATED',
    resourceType: 'CUSTOMER',
    resourceId: newCustomer.id,
    metadata: { name: newCustomer.name, segment: newCustomer.segment, email: newCustomer.email }
  });

  return { success: true, customer: newCustomer };
}

/* =========================================================================
 * 2. CRM LEADS & SALES PIPELINE (Enquiry -> Qualified -> Quotation -> Won / Lost)
 * ========================================================================= */

export function getLeadsList({ user, stage, segment, ownerId }) {
  assertPermission(user, 'crm:view');

  let list = [...memoryLeads];

  // Scoped Access Gate: sales_support can only view leads assigned to them or unassigned
  if (!isElevatedStaff(user)) {
    list = list.filter((l) => !l.ownerId || l.ownerId === user.id);
  } else if (ownerId) {
    list = list.filter((l) => l.ownerId === ownerId);
  }

  if (stage && stage !== 'ALL') {
    list = list.filter((l) => l.stage === stage);
  }
  if (segment && segment !== 'ALL') {
    list = list.filter((l) => l.segment === segment);
  }

  // Calculate pipeline metrics
  const now = new Date().toISOString().split('T')[0];
  const metrics = {
    totalLeads: list.length,
    pipelineValueMinor: list.reduce((sum, l) => (['WON', 'LOST'].includes(l.stage) ? sum : sum + (l.estimatedValueMinor || 0)), 0),
    byStage: CRM_STAGES.reduce((acc, st) => {
      acc[st] = list.filter((l) => l.stage === st).length;
      return acc;
    }, {}),
    overdueFollowUps: list.filter((l) => l.nextFollowUpDate && l.nextFollowUpDate < now && !['WON', 'LOST'].includes(l.stage)).length,
    upcomingFollowUps: list.filter((l) => l.nextFollowUpDate && l.nextFollowUpDate >= now && !['WON', 'LOST'].includes(l.stage)).length
  };

  return { leads: list, metrics };
}

export function getLeadById(id, { user }) {
  assertPermission(user, 'crm:view');
  const lead = memoryLeads.find((l) => l.id === id);
  if (!lead) throw new Error(`Lead with ID '${id}' not found.`);

  // Verify scoping for non-manager
  if (!isElevatedStaff(user) && lead.ownerId && lead.ownerId !== user.id) {
    throw new Error('Access Denied: You are not authorized to view leads assigned to another team member.');
  }
  return lead;
}

export async function createLead({
  title,
  customerId = null,
  customerName,
  customerEmail,
  customerPhone = null,
  segment = 'RETAIL',
  leadSource = 'WEBSITE',
  estimatedValueMinor = 0,
  ownerId = null,
  ownerName = null,
  nextFollowUpDate = null,
  notes = '',
  user
}) {
  assertPermission(user, 'crm:edit');

  if (!title || !customerName || !customerEmail) {
    throw new Error('Lead title, client name, and client contact email are mandatory.');
  }

  const newLead = {
    id: `lead-${Date.now().toString(36)}-${crypto.randomBytes(2).toString('hex')}`,
    title: title.trim(),
    customerId: customerId || null,
    customerName: customerName.trim(),
    customerEmail: customerEmail.toLowerCase().trim(),
    customerPhone: customerPhone ? customerPhone.trim() : null,
    segment: CUSTOMER_SEGMENTS.includes(segment) ? segment : 'RETAIL',
    leadSource,
    stage: 'ENQUIRY',
    lostReason: null,
    estimatedValueMinor: Math.max(0, parseInt(estimatedValueMinor, 10) || 0),
    currency: 'INR',
    ownerId: ownerId || user?.id || null,
    ownerName: ownerName || user?.name || 'Staff Member',
    nextFollowUpDate: nextFollowUpDate || null,
    notes: (notes || '').trim(),
    history: [
      {
        stage: 'ENQUIRY',
        changedAt: new Date().toISOString(),
        actorId: user?.id || 'staff',
        note: 'Lead created in pipeline'
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  memoryLeads.unshift(newLead);

  await logAuditEvent({
    actorId: user?.id || 'staff',
    action: 'CRM_LEAD_CREATED',
    resourceType: 'LEAD',
    resourceId: newLead.id,
    metadata: { title: newLead.title, segment: newLead.segment, valueMinor: newLead.estimatedValueMinor }
  });

  return { success: true, lead: newLead };
}

export async function updateLeadStage(id, { stage, lostReason = null, note = '', nextFollowUpDate = null, user }) {
  assertPermission(user, 'crm:edit');

  const lead = memoryLeads.find((l) => l.id === id);
  if (!lead) throw new Error(`Lead with ID '${id}' not found.`);

  // Verify staff assignment scope
  if (!isElevatedStaff(user) && lead.ownerId && lead.ownerId !== user.id) {
    throw new Error('Access Denied: You cannot update leads assigned to another team member.');
  }

  if (!CRM_STAGES.includes(stage)) {
    throw new Error(`Invalid stage '${stage}'. Allowed stages: ${CRM_STAGES.join(', ')}.`);
  }

  // Lost reason is strictly required when transitioning to LOST
  if (stage === 'LOST' && (!lostReason || !lostReason.trim())) {
    throw new Error('A detailed lostReason is mandatory when marking a lead as LOST.');
  }

  const previousStage = lead.stage;
  lead.stage = stage;
  lead.lostReason = stage === 'LOST' ? lostReason.trim() : null;
  if (nextFollowUpDate !== undefined) {
    lead.nextFollowUpDate = nextFollowUpDate;
  }
  lead.updatedAt = new Date().toISOString();

  lead.history.unshift({
    stage,
    previousStage,
    changedAt: new Date().toISOString(),
    actorId: user?.id || 'staff',
    note: note || (stage === 'LOST' ? `Lost: ${lostReason}` : `Transitioned from ${previousStage} to ${stage}`)
  });

  await logAuditEvent({
    actorId: user?.id || 'staff',
    action: 'CRM_LEAD_STAGE_UPDATED',
    resourceType: 'LEAD',
    resourceId: lead.id,
    metadata: { previousStage, stage, lostReason: lead.lostReason }
  });

  return { success: true, lead };
}

/* =========================================================================
 * 3. TEAM TASKS & IDEMPOTENT RECURRENCE ENGINE
 * ========================================================================= */

export function getTasksList({ user, status, priority, assigneeId }) {
  assertPermission(user, 'task:view');

  let list = [...memoryTasks];

  // Scoped access: regular staff can only see their tasks or unassigned tasks
  if (!isElevatedStaff(user)) {
    list = list.filter((t) => !t.assignedToUserId || t.assignedToUserId === user.id);
  } else if (assigneeId) {
    list = list.filter((t) => t.assignedToUserId === assigneeId);
  }

  if (status && status !== 'ALL') {
    list = list.filter((t) => t.status === status);
  }
  if (priority && priority !== 'ALL') {
    list = list.filter((t) => t.priority === priority);
  }

  return list;
}

export async function createTask({
  title,
  priority = 'MEDIUM',
  status = 'TODO',
  assignedTo = 'Team Member',
  assignedToUserId = null,
  dueDate = null,
  linkedRecord = null,
  recurrence = null,
  user
}) {
  assertPermission(user, 'task:create');

  if (!title || !title.trim()) {
    throw new Error('Task title is mandatory.');
  }
  if (!TASK_PRIORITIES.includes(priority)) {
    throw new Error(`Invalid priority '${priority}'. Allowed: ${TASK_PRIORITIES.join(', ')}.`);
  }
  if (recurrence && !TASK_RECURRENCES.includes(recurrence)) {
    throw new Error(`Invalid recurrence '${recurrence}'. Allowed: ${TASK_RECURRENCES.join(', ')}.`);
  }

  const newTask = {
    id: `tsk-${Date.now().toString(36)}-${crypto.randomBytes(2).toString('hex')}`,
    title: title.trim(),
    priority,
    status: TASK_STATUSES.includes(status) ? status : 'TODO',
    assignedTo: (assignedTo || 'Team Member').trim(),
    assignedToUserId: assignedToUserId || null,
    dueDate: dueDate || null,
    linkedRecord: linkedRecord ? linkedRecord.trim() : null,
    recurrence: recurrence || null,
    lastGeneratedDate: recurrence ? (dueDate || new Date().toISOString().split('T')[0]) : null,
    parentTaskId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  memoryTasks.unshift(newTask);

  await logAuditEvent({
    actorId: user?.id || 'staff',
    action: 'TEAM_TASK_CREATED',
    resourceType: 'TASK',
    resourceId: newTask.id,
    metadata: { title: newTask.title, priority: newTask.priority, recurrence: newTask.recurrence }
  });

  return { success: true, task: newTask };
}

export async function updateTask(id, updates = {}, { user }) {
  assertPermission(user, 'task:edit');

  const task = memoryTasks.find((t) => t.id === id);
  if (!task) throw new Error(`Task with ID '${id}' not found.`);

  // Assignment changes require task:assign permission (Manager or Owner)
  if (updates.assignedToUserId && updates.assignedToUserId !== task.assignedToUserId) {
    assertPermission(user, 'task:assign');
  }

  if (updates.status && !TASK_STATUSES.includes(updates.status)) {
    throw new Error(`Invalid status '${updates.status}'. Allowed: ${TASK_STATUSES.join(', ')}.`);
  }
  if (updates.priority && !TASK_PRIORITIES.includes(updates.priority)) {
    throw new Error(`Invalid priority '${updates.priority}'. Allowed: ${TASK_PRIORITIES.join(', ')}.`);
  }

  Object.assign(task, updates, { updatedAt: new Date().toISOString() });

  await logAuditEvent({
    actorId: user?.id || 'staff',
    action: 'TEAM_TASK_UPDATED',
    resourceType: 'TASK',
    resourceId: task.id,
    metadata: updates
  });

  return { success: true, task };
}

/**
 * Recurrence Engine: Generates exactly once per scheduled occurrence
 * @param {string} asOfDate - ISO date string (YYYY-MM-DD), defaults to today
 */
export function generateRecurringTasks({ asOfDate = new Date().toISOString().split('T')[0] } = {}) {
  const recurringTemplates = memoryTasks.filter((t) => t.recurrence && !t.parentTaskId);
  const generated = [];

  for (const template of recurringTemplates) {
    const lastDate = template.lastGeneratedDate || template.dueDate || template.createdAt.split('T')[0];

    // Compute whether a new occurrence is due
    let isDue = false;
    let nextDue = '';

    const last = new Date(lastDate);
    const target = new Date(asOfDate);
    const diffDays = Math.floor((target - last) / (1000 * 60 * 60 * 24));

    if (template.recurrence === 'DAILY' && diffDays >= 1) {
      isDue = true;
      const d = new Date(last);
      d.setDate(d.getDate() + 1);
      nextDue = d.toISOString().split('T')[0];
    } else if (template.recurrence === 'WEEKLY' && diffDays >= 7) {
      isDue = true;
      const d = new Date(last);
      d.setDate(d.getDate() + 7);
      nextDue = d.toISOString().split('T')[0];
    } else if (template.recurrence === 'MONTHLY' && diffDays >= 30) {
      isDue = true;
      const d = new Date(last);
      d.setDate(d.getDate() + 30);
      nextDue = d.toISOString().split('T')[0];
    }

    if (isDue) {
      const instance = {
        id: `tsk-rec-inst-${Date.now().toString(36)}-${crypto.randomBytes(2).toString('hex')}`,
        title: `${template.title} (${nextDue})`,
        priority: template.priority,
        status: 'TODO',
        assignedTo: template.assignedTo,
        assignedToUserId: template.assignedToUserId,
        dueDate: nextDue,
        linkedRecord: template.linkedRecord,
        recurrence: null,
        lastGeneratedDate: null,
        parentTaskId: template.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      template.lastGeneratedDate = asOfDate;
      template.updatedAt = new Date().toISOString();
      memoryTasks.unshift(instance);
      generated.push(instance);
    }
  }

  return { success: true, generatedCount: generated.length, generated };
}

/* =========================================================================
 * 4. SUPPORT TICKETS
 * ========================================================================= */

export function getSupportTicketsList({ user, status, category }) {
  assertPermission(user, 'support:view');

  let list = [...memorySupportTickets];
  if (status && status !== 'ALL') {
    list = list.filter((t) => t.status === status);
  }
  if (category && category !== 'ALL') {
    list = list.filter((t) => t.category === category);
  }
  return list;
}

export async function createSupportTicket({
  customerName,
  customerEmail,
  subject,
  priority = 'MEDIUM',
  category = 'PRODUCT_ENQUIRY',
  linkedOrderNumber = null,
  user
}) {
  assertPermission(user, 'support:edit');

  if (!customerName || !customerEmail || !subject) {
    throw new Error('Customer name, email, and issue subject are required.');
  }

  const newTicket = {
    id: `tkt-${Date.now().toString(36)}-${crypto.randomBytes(2).toString('hex')}`,
    ticketNumber: `TKT-2026-${String(memorySupportTickets.length + 1).padStart(3, '0')}`,
    customerName: customerName.trim(),
    customerEmail: customerEmail.toLowerCase().trim(),
    subject: subject.trim(),
    priority: TASK_PRIORITIES.includes(priority) ? priority : 'MEDIUM',
    status: 'OPEN',
    category,
    assignedTo: user?.id || null,
    linkedOrderNumber: linkedOrderNumber ? linkedOrderNumber.trim() : null,
    resolution: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  memorySupportTickets.unshift(newTicket);
  return { success: true, ticket: newTicket };
}

export async function resolveSupportTicket(id, { resolution, user }) {
  assertPermission(user, 'support:edit');

  const ticket = memorySupportTickets.find((t) => t.id === id);
  if (!ticket) throw new Error(`Support ticket '${id}' not found.`);
  if (!resolution || !resolution.trim()) {
    throw new Error('Resolution notes are required to resolve a support ticket.');
  }

  ticket.status = 'RESOLVED';
  ticket.resolution = resolution.trim();
  ticket.updatedAt = new Date().toISOString();

  return { success: true, ticket };
}
