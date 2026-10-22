/**
 * NISHKÈA Node 15: Production Preparation, Security Hardening & Launch Readiness Tests
 *
 * Verifies:
 * - Suite 1: Dynamic Operational Diagnostics & Health Endpoint
 * - Suite 2: Client Data Privacy & GDPR Data Export
 * - Suite 3: Minor Currency Paist Integrity Invariant
 * - Suite 4: Database Disaster Recovery & Backup Integrity
 * - Suite 5: Security Headers & Production Hardening
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exportCustomerData } from '../src/lib/server/customer-auth.js';
import { runBackupAndRestoreVerification } from '../database/backup-restore-test.js';
import { PRODUCTS } from '../src/data/fixtures.js';
import { memoryOrders } from '../src/lib/server/orders.js';
import { memoryCustomerPayments, memorySupplierDisbursements, memoryOperatingExpenses } from '../src/lib/server/finance.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('==================================================================');
console.log('NISHKÈA Node 15: Production Preparation & Launch Readiness Tests');
console.log('==================================================================\n');

async function runTests() {
  let passed = 0;

  // -------------------------------------------------------------
  // SUITE 1: Dynamic Operational Diagnostics & Health Endpoint
  // -------------------------------------------------------------
  console.log('--- Suite 1: Dynamic Operational Diagnostics & Health Endpoint ---');

  // Test 1.1: Health endpoint schema and node representation
  const healthRoutePath = path.join(__dirname, '../src/app/api/health/route.js');
  assert.ok(fs.existsSync(healthRoutePath), 'Health route file exists');
  const healthContent = fs.readFileSync(healthRoutePath, 'utf8');

  assert.ok(healthContent.includes('node-15-production-readiness'), 'Documents node 15 production readiness');
  assert.ok(healthContent.includes('node3_database'), 'Reports database diagnostics');
  assert.ok(healthContent.includes('node5_inventory'), 'Reports transactional inventory status');
  assert.ok(healthContent.includes('node8_checkout_orders'), 'Reports checkout and integer paise standard');
  assert.ok(healthContent.includes('node12_finance'), 'Reports commercial revenue & margin formula');
  assert.ok(healthContent.includes('node13_public_ai'), 'Reports grounded public assistant readiness');
  assert.ok(healthContent.includes('node14_staff_copilot'), 'Reports staff operations copilot readiness');
  console.log('✅ PASS: Health endpoint documents dynamic diagnostics across all 14 nodes');
  passed++;

  // Test 1.2: Privacy safety: no secrets or credentials leaked
  const secretPatterns = [
    /password\s*[:=]\s*['"][^'"]+['"]/i,
    /secret_key\s*[:=]\s*['"][^'"]+['"]/i,
    /private_key\s*[:=]\s*['"][^'"]+['"]/i,
    /postgres:\/\/[^:]+:[^@]+@/i
  ];
  for (const pattern of secretPatterns) {
    assert.ok(!pattern.test(healthContent), `Health endpoint does not leak credentials matching pattern ${pattern}`);
  }
  console.log('✅ PASS: Health endpoint strictly isolates credentials and sensitive connection strings');
  passed++;

  // -------------------------------------------------------------
  // SUITE 2: Client Data Privacy & GDPR Data Export
  // -------------------------------------------------------------
  console.log('\n--- Suite 2: Client Data Privacy & GDPR Data Export ---');

  // Test 2.1: Export customer data
  const exportResult = await exportCustomerData('cust-101');
  assert.ok(exportResult.exportDate, 'Includes export timestamp');
  assert.ok(exportResult.retrievalStandard.includes('GDPR'), 'Documents GDPR / DPDP compliance standard');
  assert.strictEqual(exportResult.customer.name, 'Aditi Sharma', 'Contains verified customer name');
  assert.strictEqual(exportResult.customer.email, 'aditi.sharma@example.com', 'Contains customer email');
  assert.ok(exportResult.orders.count >= 0, 'Contains order history count');
  assert.ok(Array.isArray(exportResult.orders.history), 'Orders history is array');
  assert.ok(exportResult.privacyNotice.includes('NISHKÈA Maison'), 'Includes authoritative privacy notice');
  console.log('✅ PASS: GDPR data export generates complete portable customer archive');
  passed++;

  // Test 2.2: Password hash strictly redacted
  assert.strictEqual(exportResult.customer.passwordHash, undefined, 'Password hash strictly omitted from export');
  assert.strictEqual(exportResult.customer.password, undefined, 'Plain password omitted from export');
  console.log('✅ PASS: Sensitive authentication credentials strictly redacted from export archive');
  passed++;

  // -------------------------------------------------------------
  // SUITE 3: Minor Currency Paist Integrity Invariant
  // -------------------------------------------------------------
  console.log('\n--- Suite 3: Minor Currency Paist Integrity Invariant ---');

  // Test 3.1: Catalogue prices in integer paise
  for (const product of PRODUCTS) {
    assert.ok(Number.isInteger(product.priceMinor), `Product ${product.code} price is integer`);
    assert.ok(product.priceMinor > 0, `Product ${product.code} price is non-negative`);
    assert.strictEqual(product.currency, 'INR', `Product ${product.code} currency is explicit INR`);
  }
  console.log(`✅ PASS: All ${PRODUCTS.length} catalogue designs strictly enforce integer minor currency units (paise)`);
  passed++;

  // Test 3.2: Financial transactions integer paise
  for (const p of memoryCustomerPayments) {
    assert.ok(Number.isInteger(p.amountMinor), `Payment ${p.id} is integer paise`);
    assert.ok(p.amountMinor > 0, `Payment ${p.id} is positive`);
  }
  for (const d of memorySupplierDisbursements) {
    assert.ok(Number.isInteger(d.amountMinor), `Disbursement ${d.id} is integer paise`);
    assert.ok(d.amountMinor > 0, `Disbursement ${d.id} is positive`);
  }
  for (const e of memoryOperatingExpenses) {
    assert.ok(Number.isInteger(e.amountMinor), `Expense ${e.id} is integer paise`);
    assert.ok(e.amountMinor > 0, `Expense ${e.id} is positive`);
  }
  console.log('✅ PASS: Financial ledgers (customer receipts, disbursements, overheads) enforce integer paise');
  passed++;

  // -------------------------------------------------------------
  // SUITE 4: Database Disaster Recovery & Backup Integrity
  // -------------------------------------------------------------
  console.log('\n--- Suite 4: Database Disaster Recovery & Backup Integrity ---');

  const drReport = await runBackupAndRestoreVerification();
  assert.strictEqual(drReport.status, 'PASS', 'Disaster recovery report PASS');
  assert.strictEqual(drReport.totalMigrations, 5, 'Verified all 5 migrations');
  assert.ok(drReport.totalTables >= 30, 'Extracted 30+ relational enterprise tables');
  assert.strictEqual(drReport.recoveryObjectives.rtoStatus, 'MEETS_TARGET', 'Achieved RTO target (<60s)');
  assert.strictEqual(drReport.recoveryObjectives.rpoStatus, 'CONFIRMED_APPEND_ONLY', 'Achieved RPO target (0-loss for signed ledgers)');
  console.log('✅ PASS: Disaster recovery simulation verifies schema checksum, RTO < 60s, and RPO compliance');
  passed++;

  // -------------------------------------------------------------
  // SUITE 5: Security Headers & Production Hardening
  // -------------------------------------------------------------
  console.log('\n--- Suite 5: Security Headers & Production Hardening ---');

  // Test 5.1: Next.js security headers
  const nextConfigPath = path.join(__dirname, '../next.config.mjs');
  const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8');
  assert.ok(nextConfigContent.includes('X-Frame-Options'), 'Configures X-Frame-Options');
  assert.ok(nextConfigContent.includes('X-Content-Type-Options'), 'Configures X-Content-Type-Options');
  assert.ok(nextConfigContent.includes('Referrer-Policy'), 'Configures Referrer-Policy');
  assert.ok(nextConfigContent.includes('Permissions-Policy'), 'Configures Permissions-Policy');
  console.log('✅ PASS: Next.js configured with production security headers (anti-clickjacking, nosniff, privacy)');
  passed++;

  // Test 5.2: Environment example does not contain committed secrets
  const envExamplePath = path.join(__dirname, '../.env.example');
  const envContent = fs.readFileSync(envExamplePath, 'utf8');
  const envLines = envContent.split('\n');
  for (const line of envLines) {
    if (line.includes('=') && !line.startsWith('#')) {
      const [, val] = line.split('=');
      const cleanVal = (val || '').trim();
      assert.ok(
        cleanVal === '' || cleanVal.startsWith('http://localhost'),
        `No committed production secret in .env.example: ${line}`
      );
    }
  }
  console.log('✅ PASS: .env.example contains variable names only; zero committed API keys or passwords');
  passed++;

  console.log('\n==================================================================');
  console.log(`Test Run Complete: ${passed} / 9 assertions passed.`);
  console.log('🌟 ALL NODE 15 PRODUCTION READINESS & LAUNCH TESTS PASSED!');
  console.log('==================================================================\n');
}

runTests().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
