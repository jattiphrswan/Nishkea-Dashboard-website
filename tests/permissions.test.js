/**
 * Node 3 Acceptance Gate Test Suite: RBAC & Denied-Access Verification
 * Run: node tests/permissions.test.js
 */

const { checkPermission, ROLE_PERMISSIONS } = require('../src/lib/server/permissions');
const { hashPassword, verifyPassword, generateSessionToken } = require('../src/lib/server/auth');

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

console.log('=====================================================');
console.log('NISHKÈA Node 3: RBAC & Denied-Access Acceptance Tests');
console.log('=====================================================\n');

// 1. Deny by Default
const anonResult = checkPermission(null, 'product:create');
assert(anonResult.allowed === false, 'Unauthenticated user denied by default');

const emptyRoleResult = checkPermission({ roleId: '' }, 'order:view');
assert(emptyRoleResult.allowed === false, 'User with blank role denied access');

const invalidRoleResult = checkPermission({ roleId: 'hacker' }, 'product:publish');
assert(invalidRoleResult.allowed === false, 'Unrecognized role denied by default');

// 2. Supplier Cost Isolation Rule (docs/PERMISSIONS.md)
// Public/Sales/Inventory must NEVER have access to supplier costs
const invCostResult = checkPermission({ roleId: 'inventory_staff' }, 'cost:view');
assert(invCostResult.allowed === false, 'Inventory staff DENIED supplier cost view');

const salesCostResult = checkPermission({ roleId: 'sales_support' }, 'cost:view');
assert(salesCostResult.allowed === false, 'Sales staff DENIED supplier cost view');

const managerCostResult = checkPermission({ roleId: 'manager' }, 'cost:view');
assert(managerCostResult.allowed === true, 'Operations Manager PERMITTED supplier cost view');

const ownerCostResult = checkPermission({ roleId: 'owner' }, 'cost:view');
assert(ownerCostResult.allowed === true, 'Company Owner PERMITTED supplier cost view');

// 3. Inventory Mutation Guardrails
const salesAdjResult = checkPermission({ roleId: 'sales_support' }, 'inventory:adjust');
assert(salesAdjResult.allowed === false, 'Sales staff DENIED inventory adjustments');

const invAdjResult = checkPermission({ roleId: 'inventory_staff' }, 'inventory:adjust');
assert(invAdjResult.allowed === true, 'Inventory staff PERMITTED inventory adjustments');

// 4. Role Administration Guardrails (Owner only)
const mgrRoleResult = checkPermission({ roleId: 'manager' }, 'role:manage');
assert(mgrRoleResult.allowed === false, 'Manager DENIED staff role management');

const ownerRoleResult = checkPermission({ roleId: 'owner' }, 'role:manage');
assert(ownerRoleResult.allowed === true, 'Owner PERMITTED staff role management');

// 5. Password Hashing & Verification
const testSecret = 'SuperSecureNishkeaPassword2026!';
const hashed = hashPassword(testSecret);
assert(hashed.includes(':'), 'Password hash formatted with salt:hash delimiter');
assert(verifyPassword(testSecret, hashed) === true, 'Valid password successfully verified with PBKDF2');
assert(verifyPassword('WrongPassword!', hashed) === false, 'Invalid password correctly rejected');

// 6. Session Token Cryptography
const token1 = generateSessionToken();
const token2 = generateSessionToken();
assert(token1.token !== token2.token, 'Session tokens are uniquely generated');
assert(token1.tokenHash.length === 64, 'Session token hash is valid 256-bit SHA-256');

console.log('\n=====================================================');
console.log(`Results: ${passedTests}/${totalTests} tests passed.`);
console.log('=====================================================');

if (passedTests === totalTests) {
  console.log('🎉 Node 3 Acceptance Gate: ALL TESTS PASSED');
} else {
  console.error('❌ Some acceptance tests failed.');
  process.exit(1);
}
