/**
 * Node 6 Acceptance Gate Test Suite: 30-Day Reviews, Sell-Through & Lifecycle Automation
 * Run: node tests/reviews.test.mjs
 */

import {
  calculateReviewDueDate,
  isReviewDue,
  calculateSellThroughRate,
  evaluateReviewQueue,
  recordReviewDecision,
  getReviewQueue,
  getReviewTasks
} from '../src/lib/server/reviews.js';

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

console.log('===============================================================');
console.log('NISHKÈA Node 6: 30-Day Collection Reviews Acceptance Tests');
console.log('===============================================================\n');

// 1. Due Date Calculation (30 calendar days from launch)
const launchDate = '2026-09-20';
const dueDate = calculateReviewDueDate(launchDate, 30);
assert(dueDate === '2026-10-20', `Due date correctly computed as 30 days after launch: expected 2026-10-20, got ${dueDate}`);

// 2. Is Review Due Logic
assert(isReviewDue('2026-10-15', '2026-10-20') === true, 'Review marked as due when asOfDate is after due date');
assert(isReviewDue('2026-10-20', '2026-10-20') === true, 'Review marked as due when asOfDate equals due date');
assert(isReviewDue('2026-10-28', '2026-10-20') === false, 'Review NOT due when asOfDate is before due date');

// 3. Period Sell-Through Rate Formula:
// Sell-Through = Net Units Sold / (Opening Sellable Stock + Eligible Receipts in Period)
const stNormal = calculateSellThroughRate(38, 40, 20); // 38 / 60 = 63.333% -> 63.3%
assert(stNormal.formatted === '63.3%', `Sell-through calculated as 63.3%: got ${stNormal.formatted}`);
assert(stNormal.percentage === 63.3, `Sell-through percentage is numeric 63.3: got ${stNormal.percentage}`);

const stZeroUnits = calculateSellThroughRate(0, 0, 0);
assert(stZeroUnits.formatted === 'N/A', `Zero total stock denominator gracefully formats as N/A: got ${stZeroUnits.formatted}`);
assert(stZeroUnits.percentage === 0, `Zero total stock returns 0 percentage: got ${stZeroUnits.percentage}`);

// 4. Idempotent Review Queue Evaluation
const eval1 = evaluateReviewQueue('2026-10-20');
assert(eval1.evaluatedItems >= 4, `Evaluated queue items: count ${eval1.evaluatedItems}`);

const eval2 = evaluateReviewQueue('2026-10-20');
assert(eval2.newTasksCreated === 0, `Idempotency: Re-running evaluation does not create duplicate tasks: got ${eval2.newTasksCreated}`);

// 5. Decision Recording - Authorization Guardrail
let salesDenied = false;
try {
  await recordReviewDecision({
    designCode: 'NSK-EAR-001',
    decision: 'CONTINUE',
    reason: 'Strong performance across weekend markets',
    actor: { id: 'usr-sales-01', roleId: 'sales_support' }
  });
} catch (err) {
  salesDenied = err.message.includes('Forbidden');
}
assert(salesDenied === true, 'Sales staff DENIED permission to record collection review decisions');

// 6. Decision Recording - CONTINUE (Extend 30 Days)
const mgrActor = { id: 'usr-mgr-01', roleId: 'manager' };
const continueResult = await recordReviewDecision({
  designCode: 'NSK-EAR-001',
  decision: 'CONTINUE',
  reason: 'Strong performance (63.3% sell-through); extending trend by 30 days',
  actor: mgrActor
});
assert(continueResult.success === true, 'Operations Manager successfully records CONTINUE decision');
assert(continueResult.item.status === 'active', 'CONTINUE decision transitions status to active');
assert(continueResult.item.reorderPolicy === 'standard', 'CONTINUE preserves standard reorder policy');

// 7. Decision Recording - CLEARANCE
const clearanceResult = await recordReviewDecision({
  designCode: 'NSK-NOS-005',
  decision: 'CLEARANCE',
  reason: 'Sell-through is below target; markdown applied to clear remaining inventory',
  actor: mgrActor
});
assert(clearanceResult.success === true, 'Successfully records CLEARANCE decision');
assert(clearanceResult.item.status === 'clearance', 'CLEARANCE decision transitions status to clearance');
assert(clearanceResult.item.reorderPolicy === 'blocked_clearance', 'CLEARANCE decision blocks reorders');

// 8. Decision Recording - PROMOTE_TO_PERMANENT
const permResult = await recordReviewDecision({
  designCode: 'NSK-RNG-002',
  decision: 'PROMOTE_TO_PERMANENT',
  reason: 'Consistent repeat demand; graduating into permanent core collection',
  actor: { id: 'usr-owner-01', roleId: 'owner' }
});
assert(permResult.success === true, 'Owner successfully records PROMOTE_TO_PERMANENT');
assert(permResult.item.collectionType === 'permanent', 'Graduated item transitions to permanent collection');
assert(permResult.item.reorderPolicy === 'reorder_suggested', 'Permanent collection enables reorder suggestions');

// 9. Task Resolution Linkage
const tasks = getReviewTasks();
const earTask = tasks.find(t => t.linkedRecord === 'NSK-EAR-001');
assert(earTask && earTask.status === 'RESOLVED', 'Linked operational task automatically marked RESOLVED upon decision');

// 10. Audit Logging Verification
assert(continueResult.decisionRecord.actorId === 'usr-mgr-01', 'Decision record tracks deciding actor ID');
assert(continueResult.decisionRecord.decidedAt !== undefined, 'Decision record tracks immutable decision timestamp');

console.log('\n===============================================================');
console.log(`Results: ${passedTests}/${totalTests} tests passed.`);
console.log('===============================================================');

if (passedTests === totalTests) {
  console.log('🎉 Node 6 Acceptance Gate: ALL TESTS PASSED\n');
} else {
  console.error('❌ Node 6 Acceptance Gate: SOME TESTS FAILED\n');
  process.exit(1);
}
