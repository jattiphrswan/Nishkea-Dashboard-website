/**
 * NISHKÈA Product Management & WooCommerce-Style Catalogue Engine — Node 16
 *
 * Implements:
 * 1. Full CRUD for jewellery designs and variant matrices with audit trail logging
 * 2. General information (Title, Slug, Short Description, Full Editorial Narrative)
 * 3. Integer minor currency pricing (Paise, INR) & sale scheduling
 * 4. Artisanal specifications (Materials, Provenance, Care, Dimensions, Weight)
 * 5. Variant options, finish swatches, and automated variation matrix generator
 * 6. Variant uniqueness enforcement (no duplicate variant SKUs across product/catalogue)
 * 7. WooCommerce-style inventory controls (SKU, Stock Status, Low Stock Alert, Sold Individually)
 * 8. Linked products (Upsells "Complete the Look" & Cross-Sells)
 * 9. Soft-archive deletion (preserves historical order link integrity)
 * 10. Publishing & collection lifecycle controls (Draft, Active, Clearance, Archived)
 */

import { PRODUCTS } from '../../data/fixtures.js';
import { logAuditEvent } from './permissions.js';

// In-memory mutable products store
export let memoryProducts = JSON.parse(JSON.stringify(PRODUCTS));

/**
 * Reset memory store (useful for test isolation)
 */
export function resetMemoryProducts() {
  memoryProducts = JSON.parse(JSON.stringify(PRODUCTS));
}

/**
 * List products with optional category, search, and lifecycle filtering
 */
export function getProductsList({ category, search, lifecycle, publishState } = {}) {
  let list = [...memoryProducts];

  if (category && category !== 'all') {
    list = list.filter((p) => p.category === category || p.categoryName?.toLowerCase() === category.toLowerCase());
  }

  if (lifecycle && lifecycle !== 'all') {
    list = list.filter((p) => p.lifecycle === lifecycle);
  }

  if (publishState && publishState !== 'all') {
    list = list.filter((p) => p.publishState === publishState);
  }

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.materials?.toLowerCase().includes(q)
    );
  }

  return list;
}

/**
 * Get product by ID or slug or code
 */
export function getProductById(idOrSlug) {
  if (!idOrSlug) return null;
  return memoryProducts.find(
    (p) => p.id === idOrSlug || p.slug === idOrSlug || p.code === idOrSlug
  ) || null;
}

/**
 * Validate variant uniqueness within a product
 */
export function validateVariants(variants, parentCode) {
  if (!Array.isArray(variants)) return [];
  const seenSkus = new Set();
  
  for (const v of variants) {
    if (!v.sku || typeof v.sku !== 'string' || !v.sku.trim()) {
      throw new Error(`Variant SKU is required for all variations of design '${parentCode}'`);
    }
    const cleanSku = v.sku.trim().toUpperCase();
    if (seenSkus.has(cleanSku)) {
      throw new Error(`Duplicate variant SKU '${cleanSku}' detected. Each variant must possess a distinct SKU.`);
    }
    seenSkus.add(cleanSku);
  }

  return variants.map((v) => ({
    ...v,
    sku: v.sku.trim().toUpperCase(),
    priceMinor: v.priceMinor !== undefined ? parseInt(v.priceMinor, 10) : undefined,
    sellable: v.sellable !== undefined ? parseInt(v.sellable, 10) : 0,
    reserved: v.reserved !== undefined ? parseInt(v.reserved, 10) : 0
  }));
}

/**
 * WooCommerce-Style Variation Matrix Generator
 * Generates discrete variant combinations (e.g., finishes x sizes) with unique SKUs
 */
export function generateVariantMatrix({ baseCode, finishes = [], sizes = [], basePriceMinor = 199900 }) {
  if (!baseCode) throw new Error('Base design code is required to generate variant matrix');
  
  const results = [];
  const cleanCode = baseCode.trim().toUpperCase();

  const effectiveFinishes = finishes.length > 0 ? finishes : [{ code: 'STD', name: 'Standard Gold', hex: '#D4AF37' }];
  const effectiveSizes = sizes.length > 0 ? sizes : [null];

  for (const finish of effectiveFinishes) {
    for (const size of effectiveSizes) {
      const finishCode = (finish.code || finish.name.slice(0, 3)).toUpperCase();
      const sizeSuffix = size ? `-${size.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()}` : '';
      const sku = `${cleanCode}-${finishCode}${sizeSuffix}`;
      const name = size ? `${finish.name} (${size})` : finish.name;

      results.push({
        sku,
        name,
        colour: finish.name || 'Gold',
        hex: finish.hex || '#D4AF37',
        size: size || undefined,
        priceMinor: basePriceMinor,
        sellable: 0,
        reserved: 0
      });
    }
  }

  // Double check uniqueness
  validateVariants(results, cleanCode);
  return results;
}

/**
 * Update product with WooCommerce-style options
 */
export async function updateProduct(idOrSlug, updates, actorId = 'usr-admin-01') {
  const index = memoryProducts.findIndex(
    (p) => p.id === idOrSlug || p.slug === idOrSlug || p.code === idOrSlug
  );

  if (index === -1) {
    throw new Error(`Product '${idOrSlug}' not found`);
  }

  const existing = memoryProducts[index];

  // Validate price integrity if provided
  let priceMinor = existing.priceMinor;
  if (updates.priceMinor !== undefined) {
    const parsed = parseInt(updates.priceMinor, 10);
    if (isNaN(parsed) || parsed < 0) {
      throw new Error('Retail price must be a non-negative integer in minor currency units (paise)');
    }
    priceMinor = parsed;
  }

  // Validate sale price
  let salePriceMinor = updates.salePriceMinor !== undefined
    ? (updates.salePriceMinor === null || updates.salePriceMinor === '' ? null : parseInt(updates.salePriceMinor, 10))
    : existing.salePriceMinor;

  if (salePriceMinor !== undefined && salePriceMinor !== null) {
    if (isNaN(salePriceMinor) || salePriceMinor < 0) {
      throw new Error('Sale price must be a non-negative integer in minor currency units (paise)');
    }
    if (salePriceMinor >= priceMinor) {
      throw new Error('Sale price must be strictly lower than regular retail price');
    }
  }

  // Validate sale dates
  if (updates.saleStartDate && updates.saleEndDate) {
    if (new Date(updates.saleStartDate) > new Date(updates.saleEndDate)) {
      throw new Error('Sale start date cannot be later than sale end date');
    }
  }

  // Validate variant uniqueness if updating variants
  let validatedVariants = existing.variants;
  if (updates.variants !== undefined) {
    validatedVariants = validateVariants(updates.variants, existing.code);
  }

  // Process and sanitize updates
  const updated = {
    ...existing,
    ...updates,
    priceMinor,
    salePriceMinor: salePriceMinor || null,
    variants: validatedVariants,
    lowStockThreshold: updates.lowStockThreshold !== undefined ? parseInt(updates.lowStockThreshold, 10) : (existing.lowStockThreshold || 5),
    soldIndividually: updates.soldIndividually !== undefined ? Boolean(updates.soldIndividually) : (existing.soldIndividually || false),
    upsellIds: Array.isArray(updates.upsellIds) ? updates.upsellIds : (existing.upsellIds || []),
    crossSellIds: Array.isArray(updates.crossSellIds) ? updates.crossSellIds : (existing.crossSellIds || []),
    images: Array.isArray(updates.images) ? updates.images : existing.images,
    featuredImage: updates.featuredImage || (Array.isArray(updates.images) && updates.images.length > 0 ? (typeof updates.images[0] === 'string' ? updates.images[0] : updates.images[0]?.url) : existing.featuredImage),
    updatedAt: new Date().toISOString()
  };

  memoryProducts[index] = updated;

  await logAuditEvent({
    actorId,
    action: 'PRODUCT_UPDATED',
    resourceType: 'PRODUCT',
    resourceId: existing.id,
    metadata: {
      code: existing.code,
      updatedFields: Object.keys(updates)
    }
  });

  return {
    success: true,
    product: updated
  };
}

/**
 * Soft-delete / Archive a product design (preserves historical order links)
 */
export async function deleteProduct(idOrSlug, actorId = 'usr-admin-01') {
  const index = memoryProducts.findIndex(
    (p) => p.id === idOrSlug || p.slug === idOrSlug || p.code === idOrSlug
  );

  if (index === -1) {
    throw new Error(`Product '${idOrSlug}' not found`);
  }

  const existing = memoryProducts[index];

  // Soft archive to preserve historical order link integrity
  const archived = {
    ...existing,
    lifecycle: 'archived',
    publishState: 'draft',
    updatedAt: new Date().toISOString()
  };

  memoryProducts[index] = archived;

  await logAuditEvent({
    actorId,
    action: 'PRODUCT_ARCHIVED',
    resourceType: 'PRODUCT',
    resourceId: existing.id,
    metadata: {
      code: existing.code,
      name: existing.name,
      reason: 'Archived by staff through product management'
    }
  });

  return {
    success: true,
    archived: true,
    product: archived
  };
}

/**
 * Create a new product design
 */
export async function createProduct(productData, actorId = 'usr-admin-01') {
  if (!productData.name || !productData.name.trim()) throw new Error('Product name is required');
  if (!productData.category) throw new Error('Category is required');

  // Slug generation and uniqueness check
  let baseSlug = productData.slug
    ? productData.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    : productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  if (!baseSlug) baseSlug = `design-${Date.now().toString(36)}`;

  let slug = baseSlug;
  let counter = 1;
  while (memoryProducts.some((p) => p.slug === slug)) {
    slug = `${baseSlug}-${counter++}`;
  }

  const id = productData.id || `des-${Date.now().toString(36)}`;
  const code = productData.code || `NSK-${productData.category.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

  // Validate price
  const priceMinor = parseInt(productData.priceMinor || 199900, 10);
  if (isNaN(priceMinor) || priceMinor < 0) {
    throw new Error('Retail price must be a non-negative integer in minor currency units (paise)');
  }

  // Validate sale price if provided
  let salePriceMinor = null;
  if (productData.salePriceMinor !== undefined && productData.salePriceMinor !== null && productData.salePriceMinor !== '') {
    salePriceMinor = parseInt(productData.salePriceMinor, 10);
    if (isNaN(salePriceMinor) || salePriceMinor < 0) {
      throw new Error('Sale price must be a non-negative integer in minor currency units (paise)');
    }
    if (salePriceMinor >= priceMinor) {
      throw new Error('Sale price must be strictly lower than regular retail price');
    }
  }

  // Validate variants
  const defaultVariants = [
    { sku: `${code}-01`, name: 'Standard Edition', colour: 'Gold', hex: '#D4AF37', sellable: 0, reserved: 0 }
  ];
  const initialVariants = Array.isArray(productData.variants) && productData.variants.length > 0
    ? productData.variants
    : defaultVariants;

  const validatedVariants = validateVariants(initialVariants, code);

  const images = Array.isArray(productData.images) && productData.images.length > 0
    ? productData.images
    : ['/images/prodcuts/aurelia-1.png'];

  const featuredImage = productData.featuredImage || (typeof images[0] === 'string' ? images[0] : images[0]?.url) || '/images/prodcuts/aurelia-1.png';

  const newProduct = {
    id,
    code,
    name: productData.name.trim(),
    slug,
    category: productData.category,
    categoryName: productData.categoryName || (productData.category.charAt(0).toUpperCase() + productData.category.slice(1)),
    collectionType: productData.collectionType || 'permanent',
    collectionName: productData.collectionName || 'Permanent Atelier Collection',
    productType: productData.productType || 'variable',
    lifecycle: productData.lifecycle || 'active',
    publishState: productData.publishState || 'published',
    salesUnit: productData.salesUnit || 'piece',
    priceMinor,
    salePriceMinor,
    saleStartDate: productData.saleStartDate || null,
    saleEndDate: productData.saleEndDate || null,
    currency: productData.currency || 'INR',
    taxClass: productData.taxClass || 'jewellery_gst_3',
    hsnCode: productData.hsnCode || '7113',
    description: productData.description || '',
    story: productData.story || '',
    materials: productData.materials || '18k Micron Plating, Brass Alloy',
    dimensions: productData.dimensions || '',
    weight: productData.weight || '',
    care: productData.care || 'Store in custom NISHKÈA anti-tarnish pouch. Keep away from moisture.',
    lowStockThreshold: productData.lowStockThreshold !== undefined ? parseInt(productData.lowStockThreshold, 10) : 5,
    soldIndividually: Boolean(productData.soldIndividually),
    upsellIds: Array.isArray(productData.upsellIds) ? productData.upsellIds : [],
    crossSellIds: Array.isArray(productData.crossSellIds) ? productData.crossSellIds : [],
    images,
    featuredImage,
    variants: validatedVariants,
    reviewDate: productData.reviewDate || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    reorderPolicy: productData.reorderPolicy || 'REVIEW_BASED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  memoryProducts.unshift(newProduct);

  await logAuditEvent({
    actorId,
    action: 'PRODUCT_CREATED',
    resourceType: 'PRODUCT',
    resourceId: id,
    metadata: { code, name: productData.name, slug }
  });

  return {
    success: true,
    product: newProduct
  };
}
