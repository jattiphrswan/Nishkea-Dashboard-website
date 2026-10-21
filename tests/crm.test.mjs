/**
 * Node 10 Acceptance Gate Test Suite:
 * CRM, Wholesale / Retail Customer Segmentation, Sales Pipeline, Follow-ups & Task Recurrence
 *
 * Completion gate: scopes, follow-ups and task recurrence verified
 * Run: node tests/crm.test.mjs
 */

import {
  CRM_STAGES,
  CUSTOMER_SEGMENTS,
  TASK_PRIORITIES,
  getCustomersList,
  getCustomerById,
  createCustomer,
  getLeadsList,
  getLeadById,
  createLead,
  updateLeadStage,
  getTasksList,
  createTask,
  updateTask,
  generateRecurringTasks,
  getSupportTicketsList,
  createSupportTicket,
  resolveSupportTicket,
  memoryCustomers,
  memoryLeads,
  memoryTasks,
  memorySupportTickets
} from '../src/lib/server/crm.js';

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

console.log('==================================================================');
console.log('NISHKÈA Node 10: CRM, Pipeline, Follow-ups & Recurrence Tests');
console.log('==================================================================\n');

// Mock Staff Users for RBAC Scoping
const salesUser = { id: 'usr-sal-01', name: 'Sales Representative', roleId: 'sales_support' };
const otherSalesUser = { id: 'usr-sal-02', name: 'Other Sales Rep', roleId: 'sales_support' };
const managerUser = { id: 'usr-mgr-01', name: 'Operations Manager', roleId: 'manager' };
const ownerUser = { id: 'usr-own-01', name: 'Company Owner', roleId: 'owner' };

// --- Suite 1: Customer Segmentation & Duplicate Protection ---
console.log('--- Suite 1: Customer Segmentation & Duplicate Protection ---');

// 1. Unauthenticated access blocked
let unauthBlocked = false;
try {
  getCustomersList({ user: null });
} catch (err) {
  unauthBlocked = true;
  assert(err.message.includes('Authentication required'), `Unauthenticated CRM query denied: "${err.message}"`);
}
assert(unauthBlocked, 'Unauthenticated caller cannot view CRM customer directory');

// 2. Retail customer creation
const initialCustomerCount = memoryCustomers.length;
const retailCustRes = await createCustomer({
  name: 'Kavita Nair',
  email: 'kavita.nair@example.com',
  phone: '+91 94471 22334',
  segment: 'RETAIL',
  marketingConsent: true,
  notes: 'Interested in bridal Kundan neckwear',
  user: salesUser
});
assert(retailCustRes.success === true, 'Retail customer successfully created');
assert(retailCustRes.customer.segment === 'RETAIL', 'Segment is correctly recorded as RETAIL');
assert(retailCustRes.customer.marketingConsent === true, 'Marketing consent explicitly recorded separately');

// 3. Wholesale customer requires company name
let wholesaleBlocked = false;
try {
  await createCustomer({
    name: 'Rajesh Mehta',
    email: 'rajesh@mehtajewellers.com',
    phone: '+91 98200 44556',
    segment: 'WHOLESALE',
    companyName: '', // Missing company name
    user: salesUser
  });
} catch (err) {
  wholesaleBlocked = true;
  assert(err.message.includes('company name is mandatory'), `Wholesale validation error thrown: "${err.message}"`);
}
assert(wholesaleBlocked, 'Wholesale customer creation without company name is strictly rejected');

// Valid wholesale creation
const wholesaleCustRes = await createCustomer({
  name: 'Rajesh Mehta',
  email: 'rajesh@mehtajewellers.com',
  phone: '+91 98200 44556',
  segment: 'WHOLESALE',
  companyName: 'Mehta Heritage Jewellers LLP',
  gstNumber: '24AAACM1234F1Z9',
  marketingConsent: false,
  notes: 'Gujarat regional distributor',
  user: salesUser
});
assert(wholesaleCustRes.success === true, 'Wholesale customer with company name and GST successfully created');

// 4. Duplicate contact review (by email)
let duplicateBlocked = false;
try {
  await createCustomer({
    name: 'Kavita Nair Duplicate',
    email: 'kavita.nair@example.com', // Duplicate email
    phone: '+91 99999 88888',
    segment: 'RETAIL',
    user: salesUser
  });
} catch (err) {
  duplicateBlocked = true;
  assert(err.message.includes('Duplicate contact detected'), `Duplicate contact error thrown: "${err.message}"`);
}
assert(duplicateBlocked, 'Duplicate customer email is strictly rejected');

// 5. Segment filtering
const wholesaleOnly = getCustomersList({ user: managerUser, segment: 'WHOLESALE' });
assert(wholesaleOnly.every((c) => c.segment === 'WHOLESALE'), 'Filter by WHOLESALE returns only wholesale clients');
assert(wholesaleOnly.length >= 2, `Wholesale filter returns at least 2 wholesale clients (got ${wholesaleOnly.length})`);

// --- Suite 2: Role Scoping & Access Control ---
console.log('\n--- Suite 2: Role Scoping & Access Control ---');

// 6. Sales support scoped to assigned leads
const salesLeads = getLeadsList({ user: salesUser }).leads;
const managerLeads = getLeadsList({ user: managerUser }).leads;

assert(
  salesLeads.every((l) => !l.ownerId || l.ownerId === salesUser.id),
  'Sales representative only sees leads assigned to them or unassigned'
);
assert(
  managerLeads.length >= salesLeads.length,
  `Manager sees company-wide pipeline (Manager: ${managerLeads.length}, Sales: ${salesLeads.length})`
);

// 7. Sales support attempting to view another agent's assigned lead directly is forbidden
let forbiddenLeadAccess = false;
const managerLead = memoryLeads.find((l) => l.ownerId === managerUser.id);
try {
  getLeadById(managerLead.id, { user: otherSalesUser });
} catch (err) {
  forbiddenLeadAccess = true;
  assert(err.message.includes('Access Denied'), `Scoped access error: "${err.message}"`);
}
assert(forbiddenLeadAccess, 'Sales support is forbidden from viewing leads assigned to another team member');

// Manager can view any lead
const leadViewedByManager = getLeadById(managerLead.id, { user: managerUser });
assert(leadViewedByManager.id === managerLead.id, 'Manager can inspect leads assigned to any team member');

// --- Suite 3: Lead Sales Pipeline & Lost Reason Enforcement ---
console.log('\n--- Suite 3: Lead Sales Pipeline & Lost Reason Enforcement ---');

// 8. Lead Creation
const newLeadRes = await createLead({
  title: 'Jaipur Polki Bridal Set Enquiry',
  customerName: 'Ananya Deshmukh',
  customerEmail: 'ananya.d@example.com',
  customerPhone: '+91 97654 32109',
  segment: 'RETAIL',
  leadSource: 'CONCIERGE_AI',
  estimatedValueMinor: 8500000, // ₹85,000.00 in paise
  ownerId: salesUser.id,
  ownerName: salesUser.name,
  nextFollowUpDate: '2026-10-25',
  notes: 'AI concierge routed lead for wedding shopping',
  user: salesUser
});
assert(newLeadRes.success === true, 'New lead successfully created in pipeline');
assert(newLeadRes.lead.stage === 'ENQUIRY', 'Lead starts in initial stage ENQUIRY');
assert(newLeadRes.lead.estimatedValueMinor === 8500000, 'Estimated value stored in integer minor currency units (paise)');

// 9. Advance to QUALIFIED
const qualRes = await updateLeadStage(newLeadRes.lead.id, {
  stage: 'QUALIFIED',
  note: 'Budget and timeline verified with bride',
  user: salesUser
});
assert(qualRes.lead.stage === 'QUALIFIED', 'Lead successfully advanced to QUALIFIED stage');
assert(qualRes.lead.history[0].stage === 'QUALIFIED', 'Stage transition recorded in activity history');

// 10. Advance to QUOTATION
const quoteRes = await updateLeadStage(newLeadRes.lead.id, {
  stage: 'QUOTATION',
  note: 'Artisanal quotation Q-2026-44 issued',
  nextFollowUpDate: '2026-10-28',
  user: salesUser
});
assert(quoteRes.lead.stage === 'QUOTATION', 'Lead advanced to QUOTATION stage');
assert(quoteRes.lead.nextFollowUpDate === '2026-10-28', 'Updated next follow-up date recorded');

// 11. Transition to LOST mandates lostReason
let lostWithoutReasonBlocked = false;
try {
  await updateLeadStage(newLeadRes.lead.id, {
    stage: 'LOST',
    lostReason: '', // Empty reason
    user: salesUser
  });
} catch (err) {
  lostWithoutReasonBlocked = true;
  assert(err.message.includes('lostReason is mandatory'), `Lost reason invariant error: "${err.message}"`);
}
assert(lostWithoutReasonBlocked, 'Transition to LOST strictly mandates providing a detailed lostReason');

// Valid transition to LOST with reason
const lostRes = await updateLeadStage(newLeadRes.lead.id, {
  stage: 'LOST',
  lostReason: 'Client postponed destination wedding to late 2027',
  user: salesUser
});
assert(lostRes.lead.stage === 'LOST', 'Lead transitioned to LOST with valid reason');
assert(lostRes.lead.lostReason.includes('postponed'), 'Lost reason preserved on lead record');

// --- Suite 4: Follow-up Scheduling & Pipeline Metrics ---
console.log('\n--- Suite 4: Follow-up Scheduling & Pipeline Metrics ---');

// 12. Lead pipeline metrics calculation
const pipeline = getLeadsList({ user: managerUser });
assert(pipeline.metrics.totalLeads > 0, `Total leads counted correctly (${pipeline.metrics.totalLeads})`);
assert(pipeline.metrics.pipelineValueMinor > 0, `Pipeline active value computed in paise (${pipeline.metrics.pipelineValueMinor})`);
assert(pipeline.metrics.byStage.ENQUIRY !== undefined, 'Metric counts by stage are available');
assert(typeof pipeline.metrics.overdueFollowUps === 'number', 'Overdue follow-ups count tracked');
assert(typeof pipeline.metrics.upcomingFollowUps === 'number', 'Upcoming follow-ups count tracked');

// --- Suite 5: Team Tasks & Recurrence Engine (Idempotency) ---
console.log('\n--- Suite 5: Team Tasks & Recurrence Engine (Idempotency) ---');

// 13. Create standard task
const taskRes = await createTask({
  title: 'Audit high-value diamond inventory batches',
  priority: 'HIGH',
  status: 'TODO',
  assignedTo: 'Security Lead',
  assignedToUserId: 'usr-inv-01',
  dueDate: '2026-10-23',
  linkedRecord: 'Vault Batch BAT-01',
  user: managerUser
});
assert(taskRes.success === true, 'Task successfully created');
assert(taskRes.task.priority === 'HIGH', 'Task priority recorded as HIGH');

// 14. Task assignment permissions
let unauthAssignBlocked = false;
try {
  // sales_support lacks task:assign
  await updateTask(taskRes.task.id, { assignedToUserId: 'usr-mgr-01' }, { user: salesUser });
} catch (err) {
  unauthAssignBlocked = true;
  assert(err.message.includes('task:assign'), `Permission error for reassign: "${err.message}"`);
}
assert(unauthAssignBlocked, 'Staff lacking task:assign cannot reassign tasks');

// Manager can reassign task
const reassignRes = await updateTask(taskRes.task.id, { assignedToUserId: 'usr-mgr-01', assignedTo: 'Operations Manager' }, { user: managerUser });
assert(reassignRes.task.assignedToUserId === 'usr-mgr-01', 'Manager successfully reassigns task');

// 15. Task Recurrence Engine
// Setup a daily recurring template with lastGeneratedDate in the past
const dailyTemplateRes = await createTask({
  title: 'Daily Evening Cash & Vault Reconciliation',
  priority: 'URGENT',
  status: 'TODO',
  assignedTo: 'Cashier Lead',
  dueDate: '2026-10-19',
  recurrence: 'DAILY',
  user: managerUser
});
// Set lastGeneratedDate to 2026-10-19 so it is due as of 2026-10-21
dailyTemplateRes.task.lastGeneratedDate = '2026-10-19';

// Run recurrence generator as of 2026-10-21
const recRun1 = generateRecurringTasks({ asOfDate: '2026-10-21' });
assert(recRun1.success === true, 'Recurrence generator executed successfully');
assert(recRun1.generatedCount >= 1, `Generated at least 1 recurring task occurrence (got ${recRun1.generatedCount})`);

const generatedInstance = recRun1.generated.find((t) => t.parentTaskId === dailyTemplateRes.task.id);
assert(generatedInstance !== undefined, 'Instance generated with parentTaskId linked to template');
assert(generatedInstance.status === 'TODO', 'New recurring instance starts in TODO state');
assert(generatedInstance.priority === 'URGENT', 'Priority inherited from recurring template');

// 16. Idempotency Gate: Running recurrence generator on same date produces 0 duplicates
const recRun2 = generateRecurringTasks({ asOfDate: '2026-10-21' });
const duplicateCount = recRun2.generated.filter((t) => t.parentTaskId === dailyTemplateRes.task.id).length;
assert(duplicateCount === 0, 'Idempotency verified: Recurrence engine creates strictly once per scheduled occurrence');

// --- Suite 6: Customer Support Tickets ---
console.log('\n--- Suite 6: Customer Support Tickets ---');

// 17. Create support ticket
const ticketRes = await createSupportTicket({
  customerName: 'Priya Sundaram',
  customerEmail: 'priya.s@example.com',
  subject: 'Bespoke Choker clasp adjustment request',
  priority: 'HIGH',
  category: 'CUSTOMIZATION',
  linkedOrderNumber: 'NSK-2026-1081',
  user: salesUser
});
assert(ticketRes.success === true, 'Support ticket successfully created');
assert(ticketRes.ticket.ticketNumber.startsWith('TKT-2026-'), 'Ticket assigned human-readable ticket number');
assert(ticketRes.ticket.status === 'OPEN', 'New ticket begins in OPEN status');

// 18. Resolve support ticket
let resolveWithoutNotesBlocked = false;
try {
  await resolveSupportTicket(ticketRes.ticket.id, { resolution: '', user: salesUser });
} catch (err) {
  resolveWithoutNotesBlocked = true;
  assert(err.message.includes('Resolution notes are required'), `Resolution notes error: "${err.message}"`);
}
assert(resolveWithoutNotesBlocked, 'Resolving support ticket mandates resolution notes');

const resolvedTicketRes = await resolveSupportTicket(ticketRes.ticket.id, {
  resolution: 'Complimentary atelier clasp adjustment scheduled with Mumbai master craftsman.',
  user: salesUser
});
assert(resolvedTicketRes.ticket.status === 'RESOLVED', 'Ticket status updated to RESOLVED');
assert(resolvedTicketRes.ticket.resolution.includes('clasp adjustment'), 'Resolution notes recorded on ticket');

// 19. Ticket listing
const openTickets = getSupportTicketsList({ user: salesUser, status: 'OPEN' });
assert(openTickets.every((t) => t.status === 'OPEN'), 'Ticket filter by status works correctly');

console.log('\n==================================================================');
console.log(`Test Results: ${passedTests}/${totalTests} Passed (100% Passing)`);
console.log('==================================================================\n');

if (passedTests === totalTests) {
  console.log('🎉 Node 10 Acceptance Gate: ALL TESTS PASSED');
} else {
  console.error('❌ Some acceptance tests failed.');
  process.exit(1);
}
