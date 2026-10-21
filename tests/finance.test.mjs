/**
 * Node 12 Acceptance Gate Test Suite:
 * Payment/Expense Records, Balances, Commercial Reconciliations & Business Reports
 *
 * Completion gate: balances, expense workflows, reconciliation formulas and permission scopes verified.
 * Run: node tests/finance.test.mjs
 */

import {
  EXPENSE_CATEGORIES,
  JEWELLERY_GST_RATE,
  recordCustomerPayment,
  recordSupplierDisbursement,
  recordOperatingExpense,
  processCustomerRefund,
  getFinancialSummary,
  getFinancialTransactionsList,
  generateReconciliationCSV,
  getBusinessPerformanceReports,
  memoryCustomerPayments,
  memorySupplierDisbursements,
  memoryOperatingExpenses,
  memoryRefundRecords
} from '../src/lib/server/finance.js';
import { memoryOrders } from '../src/lib/server/orders.js';
import { memoryPurchaseOrders } from '../src/lib/server/suppliers.js';

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
console.log('NISHKÈA Node 12: Finance, Balances & Commercial Reconciliations Tests');
console.log('==================================================================\n');

// Mock Staff Users for RBAC Scoping
const salesUser = { id: 'usr-sal-01', name: 'Sales Support', roleId: 'sales_support' };
const inventoryUser = { id: 'usr-inv-01', name: 'Inventory Clerk', roleId: 'inventory_staff' };
const accountsUser = { id: 'usr-acc-01', name: 'Accounts Specialist', roleId: 'accounts_staff' };
const managerUser = { id: 'usr-mgr-01', name: 'Operations Manager', roleId: 'manager' };
const ownerUser = { id: 'usr-own-01', name: 'Company Owner', roleId: 'owner' };

// --- Suite 1: Customer Receipts & Partial Allocation ---
console.log('--- Suite 1: Customer Receipts & Partial Allocation ---');

// 1. Validation: Rejects invalid or negative amounts
try {
  await recordCustomerPayment({
    orderId: 'ord-init-1081',
    amountMinor: -500,
    paymentMethod: 'RAZORPAY_UPI',
    gatewayTxnId: 'txn_neg_test',
    user: managerUser
  });
  assert(false, 'Should reject negative payment amount');
} catch (err) {
  assert(err.message.includes('greater than zero'), 'Rejects non-positive customer payment amount');
}

// 2. Validation: Rejects non-existent order
try {
  await recordCustomerPayment({
    orderId: 'non-existent-ord-9999',
    amountMinor: 100000,
    paymentMethod: 'RAZORPAY_UPI',
    gatewayTxnId: 'txn_ghost_order',
    user: managerUser
  });
  assert(false, 'Should reject non-existent order');
} catch (err) {
  assert(err.message.includes('not found'), 'Rejects payment against unknown order');
}

// 3. Successful customer payment recording
const testTxnId = `txn_test_${Date.now()}`;
const payResult = await recordCustomerPayment({
  orderId: 'ord-init-1082',
  amountMinor: 250000, // ₹2,500.00
  paymentMethod: 'RAZORPAY_UPI',
  gatewayTxnId: testTxnId,
  paymentType: 'PARTIAL_PAYMENT',
  notes: 'Installment payment received via Razorpay UPI.',
  user: managerUser
});

assert(payResult.success === true, 'Customer payment successfully recorded');
assert(payResult.payment.amountMinor === 250000, 'Payment amount preserved in integer paise');
assert(payResult.orderBalance.totalPaidMinor >= 250000, 'Order accumulated paid balance tracked accurately');

// 4. Duplicate gateway transaction ID rejection
try {
  await recordCustomerPayment({
    orderId: 'ord-init-1082',
    amountMinor: 50000,
    paymentMethod: 'RAZORPAY_UPI',
    gatewayTxnId: testTxnId,
    user: managerUser
  });
  assert(false, 'Should reject duplicate gateway transaction ID');
} catch (err) {
  assert(err.message.includes('already been processed'), 'Rejects duplicate gateway transaction ID');
}

// --- Suite 2: Supplier Disbursements & PO Dues ---
console.log('\n--- Suite 2: Supplier Disbursements & PO Dues ---');

// 5. Successful supplier disbursement against PO
const testBankRef = `NEFT_TEST_${Date.now()}`;
const disbResult = await recordSupplierDisbursement({
  purchaseOrderId: 'po-2026-0041',
  amountMinor: 500000, // ₹5,000.00
  disbursementMethod: 'NEFT_RTGS',
  bankReference: testBankRef,
  disbursementType: 'PROGRESS_PAYMENT',
  notes: 'Interim progress payment released to Jaipur Filigree Guild.',
  user: managerUser
});

assert(disbResult.success === true, 'Supplier disbursement recorded successfully');
assert(disbResult.disbursement.amountMinor === 500000, 'Disbursement amount stored in integer paise');
assert(disbResult.poBalance.totalDisbursedMinor >= 500000, 'PO accumulated disbursement updated');

// 6. Duplicate bank reference rejection
try {
  await recordSupplierDisbursement({
    purchaseOrderId: 'po-2026-0041',
    amountMinor: 200000,
    disbursementMethod: 'NEFT_RTGS',
    bankReference: testBankRef,
    user: managerUser
  });
  assert(false, 'Should reject duplicate bank reference');
} catch (err) {
  assert(err.message.includes('already been processed'), 'Rejects duplicate bank payment reference');
}

// --- Suite 3: Operating Overhead Expenses ---
console.log('\n--- Suite 3: Operating Overhead Expenses ---');

// 7. Successful operating expense creation
const expResult = await recordOperatingExpense({
  category: 'STUDIO_EQUIPMENT',
  description: 'Diamond Gemmological Microscope & Colorimeter Calibration',
  amountMinor: 4800000, // ₹48,000.00
  taxMinor: 864000,     // ₹8,640.00 (18% GST)
  vendorName: 'Zeiss Optical Instruments India',
  invoiceReference: 'ZEI-2026-99',
  paymentMode: 'BANK_TRANSFER',
  notes: 'Annual precision gem inspection equipment certification.',
  user: managerUser
});

assert(expResult.success === true, 'Operating expense recorded successfully');
assert(Boolean(expResult.expense.expenseNumber), 'Expense assigned unique expense number');
assert(expResult.expense.amountMinor === 4800000, 'Expense amount stored in paise');
assert(expResult.expense.taxMinor === 864000, 'Tax component preserved separately');

// 8. Invalid category rejection
try {
  await recordOperatingExpense({
    category: 'INVALID_CATEGORY_XYZ',
    description: 'Unknown expense',
    amountMinor: 100000,
    vendorName: 'Vendor',
    user: managerUser
  });
  assert(false, 'Should reject invalid expense category');
} catch (err) {
  assert(err.message.includes('Invalid expense category'), 'Rejects unrecognized expense category');
}

// --- Suite 4: Customer Return Refunds ---
console.log('\n--- Suite 4: Customer Return Refunds ---');

// 9. Bounded refund check (refund <= paid balance)
try {
  await processCustomerRefund({
    orderId: 'ord-init-1082',
    amountMinor: 99999999, // ₹9,99,999.99 (exceeds order total)
    reason: 'Excessive refund test',
    user: managerUser
  });
  assert(false, 'Should reject refund exceeding paid balance');
} catch (err) {
  assert(err.message.includes('exceeds refundable paid balance'), 'Rejects refund amount exceeding paid balance');
}

// 10. Successful refund processing
const refundResult = await processCustomerRefund({
  orderId: 'ord-init-1082',
  amountMinor: 100000, // ₹1,000.00
  reason: 'Customer courtesy adjustment',
  user: managerUser
});

assert(refundResult.success === true, 'Refund processed successfully');
assert(refundResult.refund.amountMinor === 100000, 'Refund recorded with integer paise value');
assert(Boolean(refundResult.refund.gatewayRefundId), 'Refund carries unique gateway reversal ID');

// --- Suite 5: Financial Summary & Commercial Reconciliations ---
console.log('\n--- Suite 5: Financial Summary & Commercial Reconciliations ---');

// 11. Financial summary reconciliation formulas
const summary = await getFinancialSummary({ user: managerUser });
assert(summary.success === true, 'Financial summary calculated successfully');
assert(summary.currency === 'INR', 'Explicit currency is INR');

const rec = summary.reconciliation;
assert(rec.grossCustomerReceiptsMinor > 0, 'Gross customer receipts computed');
assert(rec.gstCollectedMinor > 0, 'GST tax component isolated');
assert(rec.customerRefundsDisbursedMinor > 0, 'Refunds deducted from gross revenue');

// Verify Formula: Net Merchandise Revenue = Gross - GST - Refunds
const expectedNetRevenue = rec.grossCustomerReceiptsMinor - rec.gstCollectedMinor - rec.customerRefundsDisbursedMinor;
assert(rec.netMerchandiseRevenueMinor === expectedNetRevenue, 'Net merchandise revenue strictly matches Gross − GST − Refunds');

// Verify Formula: Gross Margin = Net Revenue - Allocated COGS
const expectedGrossProfit = rec.netMerchandiseRevenueMinor - rec.allocatedCogsMinor;
assert(rec.grossMerchandiseProfitMinor === expectedGrossProfit, 'Gross profit strictly matches Net Revenue − Allocated COGS');

// Verify Margin %
const expectedMarginPct = Number(((rec.grossMerchandiseProfitMinor / rec.netMerchandiseRevenueMinor) * 100).toFixed(2));
assert(rec.grossMarginPercent === expectedMarginPct, 'Gross margin percentage calculated accurately');

// Verify Operating Overheads & Operational Surplus
assert(rec.operatingExpensesTotalMinor > 0, 'Approved operating expenses aggregated');
const expectedSurplus = rec.grossMerchandiseProfitMinor - rec.operatingExpensesTotalMinor;
assert(rec.netOperationalSurplusMinor === expectedSurplus, 'Operational surplus matches Gross Profit − Operating Expenses');

// 12. Accounts Receivable & Accounts Payable
assert(rec.accountsReceivableMinor >= 0, 'Accounts receivable (customer dues) tracked');
assert(rec.accountsPayableMinor >= 0, 'Accounts payable (supplier dues) tracked');

// --- Suite 6: Server-Side RBAC Guardrails ---
console.log('\n--- Suite 6: Server-Side RBAC Guardrails ---');

// 13. Sales support DENIED access to financial summaries & supplier costs
try {
  await getFinancialSummary({ user: salesUser });
  assert(false, 'Sales support should be denied financial summary access');
} catch (err) {
  assert(err.message.includes('Access Denied'), 'Sales support role strictly denied financial summary access');
}

// 14. Inventory staff DENIED access to financial summaries
try {
  await getFinancialSummary({ user: inventoryUser });
  assert(false, 'Inventory staff should be denied financial summary access');
} catch (err) {
  assert(err.message.includes('Access Denied'), 'Inventory staff role strictly denied financial summary access');
}

// 15. Accounts staff PERMITTED access
const accountsSummary = await getFinancialSummary({ user: accountsUser });
assert(accountsSummary.success === true, 'Accounts staff permitted financial summary access');

// 16. Owner PERMITTED access
const ownerSummary = await getFinancialSummary({ user: ownerUser });
assert(ownerSummary.success === true, 'Company owner permitted financial summary access');

// --- Suite 7: CSV Audit Reconciliation Export ---
console.log('\n--- Suite 7: CSV Audit Reconciliation Export ---');

// 17. CSV generation
const csv = generateReconciliationCSV({ user: managerUser });
assert(typeof csv === 'string', 'CSV generator returns string content');
assert(csv.startsWith('TRANSACTION_TYPE,REFERENCE_ID,RELATED_ENTITY'), 'CSV starts with standard accounting headers');
assert(csv.includes('CUSTOMER_RECEIPT'), 'CSV includes customer receipt records');
assert(csv.includes('SUPPLIER_DISBURSEMENT'), 'CSV includes supplier disbursement records');
assert(csv.includes('OPERATING_EXPENSE'), 'CSV includes operating expense records');
assert(csv.includes('CUSTOMER_REFUND'), 'CSV includes refund records');

// --- Suite 8: Business Performance Reports ---
console.log('\n--- Suite 8: Business Performance Reports ---');

// 18. Sell-through rate & ageing reports
const perfReports = await getBusinessPerformanceReports({ user: managerUser });
assert(perfReports.success === true, 'Performance reports generated successfully');
assert(perfReports.sellThroughRate !== undefined, 'Contains sell-through performance metric');
assert(perfReports.sellThroughRate.formula.includes('Net Units Sold'), 'Sell-through report documents explicit formula');
assert(Array.isArray(perfReports.categoryPerformance), 'Contains category profit contribution breakdown');
assert(Array.isArray(perfReports.ageingValuation), 'Contains stock ageing valuation buckets');

console.log('\n==================================================================');
console.log(`Test Run Complete: ${passedTests} / ${totalTests} assertions passed.`);
if (passedTests === totalTests) {
  console.log('🌟 ALL NODE 12 FINANCE, BALANCES & RECONCILIATIONS TESTS PASSED!');
} else {
  console.error(`⚠️ ${totalTests - passedTests} tests failed.`);
  process.exitCode = 1;
}
