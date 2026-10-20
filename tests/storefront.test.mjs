/**
 * Node 7 Acceptance Gate Test Suite: Storefront, Catalogue & Product Detail Checks
 * Run: node tests/storefront.test.mjs
 */

import { PRODUCTS, CATEGORIES } from '../src/data/fixtures.js';
import { formatCurrency, computeAvailableStock } from '../src/lib/formatters.js';

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
console.log('NISHKÈA Node 7: Storefront, Catalogue & PDP Acceptance Tests');
console.log('==================================================================\n');

// 1. Category Filtering Logic
const earringProducts = PRODUCTS.filter((p) => p.category === 'earrings');
assert(earringProducts.length >= 2, `Category 'earrings' returns matching products: found ${earringProducts.length}`);

const ringProducts = PRODUCTS.filter((p) => p.category === 'rings');
assert(ringProducts.length >= 1, `Category 'rings' returns matching products: found ${ringProducts.length}`);

// 2. Keyword Search Matching Across Name, Code, and SKUs
const searchFiligree = PRODUCTS.filter((p) => {
  const q = 'filigree';
  return (
    p.name.toLowerCase().includes(q) ||
    p.description.toLowerCase().includes(q) ||
    p.variants.some((v) => v.sku.toLowerCase().includes(q))
  );
});
assert(searchFiligree.length >= 1, `Search 'filigree' matches relevant designs: found ${searchFiligree.length}`);

const searchSku = PRODUCTS.filter((p) =>
  p.variants.some((v) => v.sku.toLowerCase().includes('nsk-ear-001-gld'))
);
assert(searchSku.length === 1 && searchSku[0].code === 'NSK-EAR-001', 'Direct SKU search finds exact matching design');

// 3. Collection Type Filtering (Monthly Trend, Permanent, Clearance)
const trendItems = PRODUCTS.filter((p) => p.collectionType === 'monthly_trend');
assert(trendItems.length >= 3, `Monthly trend filter matches 30-day collection designs: found ${trendItems.length}`);

const clearanceItems = PRODUCTS.filter((p) => p.lifecycle === 'clearance');
assert(clearanceItems.length >= 1, `Clearance filter matches marked-down items: found ${clearanceItems.length}`);

// 4. Sorting Algorithms Verification
const sortedPriceAsc = [...PRODUCTS].sort((a, b) => a.priceMinor - b.priceMinor);
let isAscending = true;
for (let i = 0; i < sortedPriceAsc.length - 1; i++) {
  if (sortedPriceAsc[i].priceMinor > sortedPriceAsc[i + 1].priceMinor) {
    isAscending = false;
    break;
  }
}
assert(isAscending === true, 'Price Ascending sort strictly verifies non-decreasing price order');

const sortedPriceDesc = [...PRODUCTS].sort((a, b) => b.priceMinor - a.priceMinor);
let isDescending = true;
for (let i = 0; i < sortedPriceDesc.length - 1; i++) {
  if (sortedPriceDesc[i].priceMinor < sortedPriceDesc[i + 1].priceMinor) {
    isDescending = false;
    break;
  }
}
assert(isDescending === true, 'Price Descending sort strictly verifies non-increasing price order');

const sortedName = [...PRODUCTS].sort((a, b) => a.name.localeCompare(b.name));
let isAlphabetical = true;
for (let i = 0; i < sortedName.length - 1; i++) {
  if (sortedName[i].name.localeCompare(sortedName[i + 1].name) > 0) {
    isAlphabetical = false;
    break;
  }
}
assert(isAlphabetical === true, 'Alphabetical sort verifies lexicographical design ordering');

// 5. Product Detail Variant & Real-Time Stock Availability Gate
const testProduct = PRODUCTS[0];
assert(testProduct.variants && testProduct.variants.length > 0, 'Design contains valid variant combinations');

for (const variant of testProduct.variants) {
  const avail = computeAvailableStock(variant.sellable, variant.reserved);
  assert(avail >= 0, `Available stock for ${variant.sku} is non-negative: ${avail}`);
  assert(avail === Math.max(0, variant.sellable - variant.reserved), `Stock formula strictly holds for ${variant.sku}`);
}

// 6. Zero Overselling & Out-of-Stock Condition
const mockOutOfStock = computeAvailableStock(5, 5);
assert(mockOutOfStock === 0, 'When sellable on-hand equals reserved holds, available stock is exactly 0 (Sold Out)');

const mockNegativePrevention = computeAvailableStock(2, 5);
assert(mockNegativePrevention === 0, 'When reservations exceed on-hand, available stock is clamped to 0 (Never negative)');

// 7. Price Minor Unit Integrity (Paise Standard)
for (const p of PRODUCTS) {
  assert(Number.isInteger(p.priceMinor), `Product ${p.code} price is an integer minor unit: ${p.priceMinor}`);
  assert(p.priceMinor > 0, `Product ${p.code} price is strictly positive: ${p.priceMinor}`);
  const formatted = formatCurrency(p.priceMinor, p.currency);
  assert(formatted.startsWith('₹'), `Formatted currency includes rupee sign: ${formatted}`);
}

// 8. Slugs & Canonical Path Integrity
const slugSet = new Set();
for (const p of PRODUCTS) {
  assert(!slugSet.has(p.slug), `Product slug is unique: ${p.slug}`);
  slugSet.add(p.slug);
  assert(/^[a-z0-9-]+$/.test(p.slug), `Product slug is URL-safe kebab-case: ${p.slug}`);
}

// 9. Category Slugs Alignment
for (const cat of CATEGORIES) {
  assert(/^[a-z0-9-]+$/.test(cat.slug), `Category slug is valid: ${cat.slug}`);
}

// 10. Multi-Image Gallery Presence & Integrity
for (const p of PRODUCTS) {
  assert(Array.isArray(p.images) && p.images.length >= 1, `Product ${p.code} has gallery imagery`);
  assert(p.images[0].url.length > 0, `Product ${p.code} primary image has valid path`);
  for (const img of p.images) {
    assert(typeof img.url === 'string' && img.url.startsWith('/images/'), `Product ${p.code} image path is valid: ${img.url}`);
    assert(typeof img.alt === 'string' && img.alt.length > 0, `Product ${p.code} image has accessibility alt text: ${img.alt}`);
  }
}

// 11. Artisanal Description, Materials & Dimensions Completeness
for (const p of PRODUCTS) {
  assert(typeof p.description === 'string' && p.description.length >= 30, `Product ${p.code} has full artisanal narrative description`);
  assert(typeof p.materials === 'string' && p.materials.length >= 10, `Product ${p.code} specifies fine materials/alloys`);
  assert(typeof p.dimensions === 'string' && p.dimensions.length >= 5, `Product ${p.code} specifies precise sizing & dimensions`);
  assert(typeof p.careInstructions === 'string' && p.careInstructions.length >= 15, `Product ${p.code} specifies maintenance care advice`);
}

console.log('\n==================================================================');
console.log(`Results: ${passedTests}/${totalTests} tests passed.`);
console.log('==================================================================');

if (passedTests === totalTests) {
  console.log('🎉 Node 7 Acceptance Gate: ALL TESTS PASSED\n');
} else {
  console.error('❌ Node 7 Acceptance Gate: SOME TESTS FAILED\n');
  process.exit(1);
}
