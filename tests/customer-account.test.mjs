/**
 * Node 11 Acceptance Gate Test Suite:
 * Client Storefront Accounts, Self-Service Portal, Order Tracking,
 * Password Verification Gate & Atelier Contact Enquiries.
 *
 * Completion gate: client registration, authentication, profile/address updates,
 * password change verification invariant, order tracking, and contact inquiry CRM linkage verified.
 * Run: node tests/customer-account.test.mjs
 */

import {
  CUSTOMER_COOKIE_NAME,
  DEFAULT_CUSTOMER_PASSWORD,
  registerCustomerAccount,
  authenticateCustomer,
  getCurrentCustomer,
  updateCustomerProfile,
  updateCustomerPassword,
  getCustomerOrders,
  submitContactInquiry,
  memoryCustomerAccounts,
  memoryCustomerSessions,
  memoryContactInquiries
} from '../src/lib/server/customer-auth.js';
import { memoryCustomers, memoryLeads } from '../src/lib/server/crm.js';

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
console.log('NISHKÈA Node 11: Client Accounts, Tracking & Contact Portal Tests');
console.log('==================================================================\n');

// --- Suite 1: Customer Registration & Validation ---
console.log('--- Suite 1: Customer Registration & Validation ---');

// 1. Missing required registration fields
try {
  await registerCustomerAccount({ name: '', email: '', password: '' });
  assert(false, 'Should reject empty registration fields');
} catch (err) {
  assert(err.message.includes('required'), 'Rejects empty registration fields');
}

// 2. Short password rejection
try {
  await registerCustomerAccount({
    name: 'Mira Rajput',
    email: 'mira.r@example.com',
    password: '123'
  });
  assert(false, 'Should reject password under 6 characters');
} catch (err) {
  assert(err.message.includes('at least 6 characters'), 'Rejects password shorter than 6 characters');
}

// 3. Successful customer registration
const testEmail = `rohan.v_${Date.now()}@example.com`;
const regResult = await registerCustomerAccount({
  name: 'Rohan Verma',
  email: testEmail,
  phone: '+91 99887 76655',
  password: 'SecurePassword123!',
  address: {
    addressLine1: 'Penthouse 14B, Sky Towers',
    addressLine2: 'Indiranagar 100ft Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560038',
    country: 'India'
  }
});

assert(regResult.success === true, 'Successful registration returns success flag');
assert(Boolean(regResult.token), 'Registration immediately returns active session token');
assert(regResult.customer.email === testEmail, 'Customer record reflects registered email');
assert(regResult.customer.passwordHash === undefined, 'Customer profile does NOT leak password hash');

// 4. CRM synchronization
const crmCustomer = memoryCustomers.find((c) => c.email === testEmail);
assert(Boolean(crmCustomer), 'Registration synchronizes client into CRM directory');
assert(crmCustomer?.name === 'Rohan Verma', 'CRM record has correct client name');

// 5. Duplicate email rejection
try {
  await registerCustomerAccount({
    name: 'Duplicate Rohan',
    email: testEmail,
    password: 'AnotherPassword456!'
  });
  assert(false, 'Should reject duplicate email registration');
} catch (err) {
  assert(err.message.includes('already exists'), 'Rejects duplicate registration with existing email');
}

// --- Suite 2: Client Authentication & Session Management ---
console.log('\n--- Suite 2: Client Authentication & Session Management ---');

// 6. Seed client authentication
const authSeed = await authenticateCustomer('aditi.sharma@example.com', DEFAULT_CUSTOMER_PASSWORD);
assert(authSeed.success === true, 'Seed client Aditi Sharma authenticates successfully');
assert(Boolean(authSeed.token), 'Seed login returns active session token');
assert(authSeed.customer.name === 'Aditi Sharma', 'Seed login returns correct customer profile');

// 7. Invalid password rejection
try {
  await authenticateCustomer('aditi.sharma@example.com', 'WrongPasswordXYZ');
  assert(false, 'Should reject incorrect password');
} catch (err) {
  assert(err.message.includes('Invalid email or password'), 'Rejects incorrect password with safe generic error');
}

// 8. Non-existent email rejection
try {
  await authenticateCustomer('ghost.client@example.com', 'AnyPassword123!');
  assert(false, 'Should reject unknown email');
} catch (err) {
  assert(err.message.includes('Invalid email or password'), 'Rejects unknown email with safe generic error');
}

// 9. Session token verification via mock request
const mockRequestWithToken = {
  cookies: {
    get: (key) => (key === CUSTOMER_COOKIE_NAME ? { value: authSeed.token } : null)
  },
  headers: {
    get: () => null
  }
};
const sessionCustomer = await getCurrentCustomer(mockRequestWithToken);
assert(sessionCustomer !== null, 'Retrieves customer from valid session cookie');
assert(sessionCustomer?.email === 'aditi.sharma@example.com', 'Session customer matches cookie token owner');

// --- Suite 3: Client Profile & Address Updates ---
console.log('\n--- Suite 3: Client Profile & Address Updates ---');

// 10. Update name and phone
const registeredId = regResult.customer.id;
const updateResult = await updateCustomerProfile(registeredId, {
  name: 'Rohan K. Verma',
  phone: '+91 99887 00000',
  address: {
    addressLine2: 'Near Metro Pillar 42'
  }
});

assert(updateResult.success === true, 'Profile update returns success flag');
assert(updateResult.customer.name === 'Rohan K. Verma', 'Updated name reflected in returned profile');
assert(updateResult.customer.phone === '+91 99887 00000', 'Updated phone reflected in returned profile');
assert(updateResult.customer.address.addressLine2 === 'Near Metro Pillar 42', 'Merged delivery address line updated');
assert(updateResult.customer.address.city === 'Bengaluru', 'Existing delivery city preserved');

// 11. Profile update synced to CRM
const updatedCrmCustomer = memoryCustomers.find((c) => c.email === testEmail);
assert(updatedCrmCustomer?.name === 'Rohan K. Verma', 'Profile update synchronizes name into CRM record');

// --- Suite 4: Password Change Verification Gate ---
console.log('\n--- Suite 4: Password Change Verification Gate ---');

// 12. Password change with wrong current password MUST fail
try {
  await updateCustomerPassword(registeredId, {
    currentPassword: 'WrongOldPassword!',
    newPassword: 'BrandNewPassword2026!'
  });
  assert(false, 'Should reject password change with incorrect current password');
} catch (err) {
  assert(err.message.includes('Current password does not match'), 'Blocks password update when current password is invalid');
}

// 13. Password change with too-short new password
try {
  await updateCustomerPassword(registeredId, {
    currentPassword: 'SecurePassword123!',
    newPassword: 'short'
  });
  assert(false, 'Should reject short new password');
} catch (err) {
  assert(err.message.includes('at least 6 characters'), 'Rejects new password shorter than 6 characters');
}

// 14. Successful password change with valid current password
const pwdResult = await updateCustomerPassword(registeredId, {
  currentPassword: 'SecurePassword123!',
  newPassword: 'BrandNewPassword2026!'
});
assert(pwdResult.success === true, 'Password update succeeds with verified current password');

// 15. Verify client can authenticate with NEW password
const newLogin = await authenticateCustomer(testEmail, 'BrandNewPassword2026!');
assert(newLogin.success === true, 'Client authenticates successfully using newly updated password');

// 16. Verify client CANNOT authenticate with OLD password
try {
  await authenticateCustomer(testEmail, 'SecurePassword123!');
  assert(false, 'Old password should no longer authenticate');
} catch (err) {
  assert(err.message.includes('Invalid email or password'), 'Old password rejected after password rotation');
}

// --- Suite 5: Order History & Courier Shipment Tracking ---
console.log('\n--- Suite 5: Order History & Courier Shipment Tracking ---');

// 17. Seed customer order retrieval
const aditiOrders = getCustomerOrders('aditi.sharma@example.com');
assert(aditiOrders.length > 0, 'Retrieves orders for Aditi Sharma');
assert(aditiOrders[0].orderNumber === 'NSK-2026-1082', 'Returns order NSK-2026-1082 for Aditi Sharma');
assert(aditiOrders[0].fulfillmentStatus === 'DISPATCHED', 'Order has DISPATCHED fulfillment status');
assert(Boolean(aditiOrders[0].tracking), 'Order contains courier tracking object');
assert(aditiOrders[0].tracking.carrier === 'BlueDart Express', 'Courier carrier is BlueDart Express');
assert(Boolean(aditiOrders[0].tracking.trackingNumber), 'Order has valid shipment tracking number');

// 18. Customer with no orders
const emptyOrders = getCustomerOrders('nobody@example.com');
assert(Array.isArray(emptyOrders) && emptyOrders.length === 0, 'Returns empty array for customer with no orders');

// --- Suite 6: Contact Inquiry & CRM Lead Automation ---
console.log('\n--- Suite 6: Contact Inquiry & CRM Lead Automation ---');

// 19. Submit storefront inquiry
const initialLeadCount = memoryLeads.length;
const inqResult = await submitContactInquiry({
  fullName: 'Kavita Singhania',
  email: 'kavita.s@example.com',
  phone: '+91 98222 33445',
  inquiryType: 'BESPOKE_CONSULTATION',
  preferredLocation: 'JAIPUR_ATELIER',
  message: 'Requesting a heritage polki emerald bridal necklace design consultation.'
});

assert(inqResult.success === true, 'Contact inquiry submission returns success');
assert(inqResult.inquiry.name === 'Kavita Singhania', 'Contact inquiry preserves inquirer name');
assert(inqResult.inquiry.preferredLocation === 'JAIPUR_ATELIER', 'Contact inquiry preserves atelier location preference');

// 20. Inquiry auto-creates CRM lead for operations team
const newLeadCount = memoryLeads.length;
assert(newLeadCount === initialLeadCount + 1, 'Submitting contact inquiry increments CRM lead counter by 1');
const createdLead = memoryLeads[0];
assert(createdLead.customerEmail === 'kavita.s@example.com', 'Created CRM lead matches inquiry email');
assert(createdLead.leadSource === 'WEBSITE', 'CRM lead source is set to WEBSITE');
assert(createdLead.notes.includes('JAIPUR_ATELIER'), 'CRM lead notes preserve inquiry showroom location');

// 21. Rejection of incomplete inquiry
try {
  await submitContactInquiry({ fullName: '', email: '', message: '' });
  assert(false, 'Should reject empty contact inquiry');
} catch (err) {
  assert(err.message.includes('required'), 'Rejects empty contact inquiry with validation error');
}

console.log('\n==================================================================');
console.log(`Test Run Complete: ${passedTests} / ${totalTests} assertions passed.`);
if (passedTests === totalTests) {
  console.log('🌟 ALL NODE 11 CLIENT ACCOUNTS & CONTACT TESTS PASSED!');
} else {
  console.error(`⚠️ ${totalTests - passedTests} tests failed.`);
  process.exitCode = 1;
}
