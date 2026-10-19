/**
 * NISHKÈA Demo Fixture Dataset — Node 2 Foundation
 *
 * NOTE: These fixtures are strictly fictional demo records for UI preview,
 * layout validation, filter testing, and acceptance checks.
 * They are NOT live business records, real inventory, or production prices.
 */

export const DEMO_NOTICE = {
  isDemo: true,
  node: 'Node 2 — Scaffold & Design System',
  disclaimer: 'Fictional demo data. Backend database, live inventory ledger, and payment processing are not connected.'
};

export const CATEGORIES = [
  {
    id: 'cat-earrings',
    name: 'Earrings',
    slug: 'earrings',
    description: 'Chandelier drops, jhumkas, modern studs and huggie hoops crafted in pairs.',
    defaultSalesUnit: 'pair',
    estimatedDesigns: '20+ designs',
    image: '/images/categories/earrings.svg',
    featured: true
  },
  {
    id: 'cat-rings',
    name: 'Rings',
    slug: 'rings',
    description: 'Statement cocktail bands, adjustable solitaires, and delicate stackable rings.',
    defaultSalesUnit: 'piece',
    estimatedDesigns: '30+ designs',
    image: '/images/categories/rings.svg',
    featured: true
  },
  {
    id: 'cat-necklaces',
    name: 'Necklaces & Pendants',
    slug: 'necklaces',
    description: 'Layered chokers, gemstone pendants, and collar pieces with adjustable chains.',
    defaultSalesUnit: 'piece',
    estimatedDesigns: '39 designs',
    image: '/images/categories/necklaces.svg',
    featured: true
  },
  {
    id: 'cat-hair-accessories',
    name: 'Hair Accessories',
    slug: 'hair-accessories',
    description: 'Silk-blend scrunchies, pearl-studded headbands, and decorative barrettes.',
    defaultSalesUnit: 'piece',
    estimatedDesigns: '30+ designs',
    image: '/images/categories/hair-accessories.svg',
    featured: true
  },
  {
    id: 'cat-nose-rings',
    name: 'Nose Rings & Pins',
    slug: 'nose-rings',
    description: 'Traditional Maharashtrian naths, minimalist clip-on studs, and Kundan hoops.',
    defaultSalesUnit: 'piece',
    estimatedDesigns: '40+ designs',
    image: '/images/categories/nose-rings.svg',
    featured: true
  }
];

export const PRODUCTS = [
  {
    id: 'des-001',
    code: 'NSK-EAR-001',
    name: 'Aurelia Filigree Chandelier Drops',
    slug: 'aurelia-filigree-chandelier-drops',
    category: 'earrings',
    categoryName: 'Earrings',
    collectionType: 'monthly_trend',
    collectionName: 'Autumn Trend Edit',
    lifecycle: 'active',
    publishState: 'published',
    salesUnit: 'pair',
    priceMinor: 249900, // ₹2,499.00
    currency: 'INR',
    rating: 4.9,
    reviewCount: 38,
    isNew: true,
    isBestSeller: true,
    launchDate: '2026-10-01',
    reviewDate: '2026-10-31', // 30-day review cycle
    reorderPolicy: 'review_required',
    images: [
      { id: 'img-01', url: '/images/prodcuts/earring 1.png', alt: 'Aurelia Filigree Chandelier Drops pair view' },
      { id: 'img-02', url: '/images/prodcuts/earring-3.png', alt: 'Aurelia Filigree detail packaging and presentation' }
    ],
    description: 'Intricately handcrafted antique-gold tone chandeliers featuring floral filigree lacework and suspended baroque glass pearls. Designed with hypoallergenic titanium posts for lightweight evening wear.',
    careInstructions: 'Store in airtight pouch away from water, fragrance, and hairsprays. Wipe gently with dry microfiber cloth after each wear.',
    materials: 'Brass base alloy with 18k micron gold tone plating, baroque synthetic pearls, titanium ear-post.',
    dimensions: 'Length: 7.2 cm | Width: 3.4 cm | Weight: 18g per pair',
    variants: [
      { sku: 'NSK-EAR-001-GLD', colour: 'Antique Gold', size: 'Standard (7.2cm)', sellable: 18, reserved: 2, available: 16, unitCostMinor: 85000 },
      { sku: 'NSK-EAR-001-SLV', colour: 'Rhodium Silver', size: 'Standard (7.2cm)', sellable: 12, reserved: 0, available: 12, unitCostMinor: 85000 }
    ],
    stockBatches: [
      { batchId: 'BAT-202610-01', receivedDate: '2026-10-01', quantity: 20, remainingQty: 18, ageDays: 18, unitCostMinor: 85000, ageBucket: '0-30 days' }
    ]
  },
  {
    id: 'des-002',
    code: 'NSK-RNG-002',
    name: 'Celeste Marquise Solitaire Band',
    slug: 'celeste-marquise-solitaire-band',
    category: 'rings',
    categoryName: 'Rings',
    collectionType: 'permanent',
    collectionName: 'Signature Permanent',
    lifecycle: 'active',
    publishState: 'published',
    salesUnit: 'piece',
    priceMinor: 189900, // ₹1,899.00
    currency: 'INR',
    rating: 4.8,
    reviewCount: 52,
    isNew: false,
    isBestSeller: true,
    launchDate: '2026-06-15',
    reviewDate: '2026-11-15',
    reorderPolicy: 'reorder_at_threshold',
    images: [
      { id: 'img-03', url: '/images/prodcuts/ring-1.png', alt: 'Celeste Marquise Solitaire Band top angle view' },
      { id: 'img-03b', url: '/images/prodcuts/ring-3.png', alt: 'Celeste Marquise side view' }
    ],
    description: 'An architectural dual-band solitaire showcasing a faceted marquise cubic zirconia set in bezel prongs. Polished mirror finish with inner tapered comfort fit.',
    careInstructions: 'Avoid impact with abrasive hard surfaces. Clean with lukewarm water and soft bristle brush.',
    materials: 'Hypoallergenic brass with 14k pale gold electroplating and AAAAA marquise zirconia.',
    dimensions: 'Band width: 3.2 mm | Center stone: 8 × 4 mm',
    variants: [
      { sku: 'NSK-RNG-002-SZ6', colour: 'Yellow Gold', size: 'US 6 (16.5mm)', sellable: 14, reserved: 1, available: 13, unitCostMinor: 62000 },
      { sku: 'NSK-RNG-002-SZ7', colour: 'Yellow Gold', size: 'US 7 (17.3mm)', sellable: 22, reserved: 3, available: 19, unitCostMinor: 62000 },
      { sku: 'NSK-RNG-002-SZ8', colour: 'Yellow Gold', size: 'US 8 (18.1mm)', sellable: 8, reserved: 0, available: 8, unitCostMinor: 62000 }
    ],
    stockBatches: [
      { batchId: 'BAT-202606-12', receivedDate: '2026-06-15', quantity: 50, remainingQty: 44, ageDays: 126, unitCostMinor: 62000, ageBucket: '91+ days' }
    ]
  },
  {
    id: 'des-003',
    code: 'NSK-NCK-003',
    name: 'Nocturne Layered Velvet Choker',
    slug: 'nocturne-layered-velvet-choker',
    category: 'necklaces',
    categoryName: 'Necklaces & Pendants',
    collectionType: 'monthly_trend',
    collectionName: 'Autumn Trend Edit',
    lifecycle: 'under_review', // Under review at 30 days!
    publishState: 'published',
    salesUnit: 'piece',
    priceMinor: 329900, // ₹3,299.00
    currency: 'INR',
    rating: 4.7,
    reviewCount: 21,
    isNew: false,
    isBestSeller: false,
    launchDate: '2026-09-18',
    reviewDate: '2026-10-18', // 30-day review passed! Creates review task
    reorderPolicy: 'review_required',
    images: [
      { id: 'img-04', url: '/images/prodcuts/neackless-1.png', alt: 'Nocturne Layered Velvet Choker draped front view' },
      { id: 'img-04b', url: '/images/prodcuts/neackless-3.png', alt: 'Nocturne Layered Velvet Choker detail' }
    ],
    description: 'Plush wine-burgundy French velvet band paired with a tiered 18k gold vermeil curb chain and cabochon garnet drop pendant. Features an adjustable 5cm extender.',
    careInstructions: 'Keep velvet dry. Store suspended to avoid creasing.',
    materials: 'Imported silk velvet ribbon, brass chain with micron gold bath, faceted synthetic garnet.',
    dimensions: 'Velvet length: 32 cm + 6 cm extender | Drop chain: 42 cm',
    variants: [
      { sku: 'NSK-NCK-003-BUR', colour: 'Burgundy & Gold', size: 'Adjustable 32-38cm', sellable: 5, reserved: 1, available: 4, unitCostMinor: 110000 }
    ],
    stockBatches: [
      { batchId: 'BAT-202609-08', receivedDate: '2026-09-18', quantity: 15, remainingQty: 5, ageDays: 31, unitCostMinor: 110000, ageBucket: '31-60 days' }
    ]
  },
  {
    id: 'des-004',
    code: 'NSK-HAR-004',
    name: 'Seraphina Silk Scrunchie & Clip Set',
    slug: 'seraphina-silk-scrunchie-clip-set',
    category: 'hair-accessories',
    categoryName: 'Hair Accessories',
    collectionType: 'permanent',
    collectionName: 'Signature Permanent',
    lifecycle: 'active',
    publishState: 'published',
    salesUnit: 'set',
    priceMinor: 149900, // ₹1,499.00
    currency: 'INR',
    rating: 4.9,
    reviewCount: 64,
    isNew: false,
    isBestSeller: true,
    launchDate: '2026-07-10',
    reviewDate: '2026-12-10',
    reorderPolicy: 'reorder_at_threshold',
    images: [
      { id: 'img-05', url: '/images/prodcuts/scrunie.png', alt: 'Seraphina Silk Scrunchie & Clip Set styled flat lay' },
      { id: 'img-05b', url: '/images/prodcuts/scrunchie2.png', alt: 'Seraphina Silk Scrunchie collection' }
    ],
    description: 'Pure 22-momme Mulberry silk oversized scrunchie matched with two hand-set freshwater pearl gold-plated snap barrettes. Prevents hair creases and friction damage.',
    careInstructions: 'Hand wash cold using delicate silk detergent. Dry flat away from direct sunlight.',
    materials: 'Grade 6A 22-momme Mulberry silk, durable natural rubber elastic, zinc alloy clips with freshwater seed pearls.',
    dimensions: 'Scrunchie outer diameter: 14 cm | Clips: 7 cm length',
    variants: [
      { sku: 'NSK-HAR-004-IVR', colour: 'Warm Ivory', size: 'Standard Set', sellable: 30, reserved: 4, available: 26, unitCostMinor: 48000 },
      { sku: 'NSK-HAR-004-BRG', colour: 'Signature Burgundy', size: 'Standard Set', sellable: 19, reserved: 1, available: 18, unitCostMinor: 48000 }
    ],
    stockBatches: [
      { batchId: 'BAT-202607-20', receivedDate: '2026-07-10', quantity: 80, remainingQty: 49, ageDays: 101, unitCostMinor: 48000, ageBucket: '91+ days' }
    ]
  },
  {
    id: 'des-005',
    code: 'NSK-NOS-005',
    name: 'Chandrika Pearl Nath & Chain',
    slug: 'chandrika-pearl-nath-chain',
    category: 'nose-rings',
    categoryName: 'Nose Rings & Pins',
    collectionType: 'monthly_trend',
    collectionName: 'Autumn Trend Edit',
    lifecycle: 'active',
    publishState: 'published',
    salesUnit: 'piece',
    priceMinor: 179900, // ₹1,799.00
    currency: 'INR',
    rating: 4.8,
    reviewCount: 19,
    isNew: true,
    isBestSeller: false,
    launchDate: '2026-10-05',
    reviewDate: '2026-11-04',
    reorderPolicy: 'review_required',
    images: [
      { id: 'img-06', url: '/images/categories/nose-rings.svg', alt: 'Chandrika Pearl Nath traditional bridal hoop' }
    ],
    description: 'Traditional crescent non-piercing press nath with miniature Basra-style seed pearls, ruby red tourmaline glass cabochon, and delicate hairpin chain.',
    careInstructions: 'Do not bend clip excessively. Clean with dry cotton bud.',
    materials: 'Brass with 22k matte gold micro-plating, synthetic pearls, glass stones.',
    dimensions: 'Hoop diameter: 2.6 cm | Hair chain length: 18 cm',
    variants: [
      { sku: 'NSK-NOS-005-PRS', colour: 'Matte Gold / Ruby Red', size: 'Clip-On (Non-Pierced)', sellable: 24, reserved: 0, available: 24, unitCostMinor: 58000 }
    ],
    stockBatches: [
      { batchId: 'BAT-202610-04', receivedDate: '2026-10-05', quantity: 25, remainingQty: 24, ageDays: 14, unitCostMinor: 58000, ageBucket: '0-30 days' }
    ]
  },
  {
    id: 'des-006',
    code: 'NSK-EAR-006',
    name: 'Astrid Pavé Huggie Hoops',
    slug: 'astrid-pave-huggie-hoops',
    category: 'earrings',
    categoryName: 'Earrings',
    collectionType: 'permanent',
    collectionName: 'Signature Permanent',
    lifecycle: 'active',
    publishState: 'published',
    salesUnit: 'pair',
    priceMinor: 129900, // ₹1,299.00
    currency: 'INR',
    rating: 4.9,
    reviewCount: 88,
    isNew: false,
    isBestSeller: true,
    launchDate: '2026-05-01',
    reviewDate: '2026-11-01',
    reorderPolicy: 'reorder_at_threshold',
    images: [
      { id: 'img-07', url: '/images/prodcuts/Gold Hoops on Oxblood Silk.png', alt: 'Astrid Pavé Huggie Hoops on silk' },
      { id: 'img-07b', url: '/images/prodcuts/earring -2.png', alt: 'Astrid Pavé Huggie Hoops pair view' }
    ],
    description: 'Sleek everyday huggie hoops encrusted with micro-pavé zirconia stones and secure click-latch closure. Engineered for comfortable all-day wear.',
    careInstructions: 'Remove before swimming, sauna or workout. Wipe dry with soft lint-free cloth.',
    materials: 'Sterling silver base with 18k yellow gold vermeil finish, micro-pavé zirconia.',
    dimensions: 'Outer diameter: 12 mm | Inner diameter: 9 mm | Thickness: 2.2 mm',
    variants: [
      { sku: 'NSK-EAR-006-GLD', colour: 'Yellow Gold', size: '12mm', sellable: 42, reserved: 5, available: 37, unitCostMinor: 42000 },
      { sku: 'NSK-EAR-006-SLV', colour: 'White Rhodium', size: '12mm', sellable: 28, reserved: 2, available: 26, unitCostMinor: 42000 }
    ],
    stockBatches: [
      { batchId: 'BAT-202605-18', receivedDate: '2026-05-01', quantity: 100, remainingQty: 70, ageDays: 171, unitCostMinor: 42000, ageBucket: '91+ days' }
    ]
  },
  {
    id: 'des-007',
    code: 'NSK-RNG-007',
    name: 'Valeria Sculpted Wave Band',
    slug: 'valeria-sculpted-wave-band',
    category: 'rings',
    categoryName: 'Rings',
    collectionType: 'monthly_trend',
    collectionName: 'Autumn Trend Edit',
    lifecycle: 'clearance', // Clearance item! Reorder blocked
    publishState: 'published',
    salesUnit: 'piece',
    priceMinor: 119900, // Clearance price: ₹1,199.00
    currency: 'INR',
    rating: 4.6,
    reviewCount: 14,
    isNew: false,
    isBestSeller: false,
    launchDate: '2026-08-01',
    reviewDate: '2026-09-01',
    reorderPolicy: 'blocked_clearance',
    images: [
      { id: 'img-08', url: '/images/prodcuts/ring-2.png', alt: 'Valeria Sculpted Wave Band organic undulating ring' },
      { id: 'img-08b', url: '/images/prodcuts/ring-4.png', alt: 'Valeria Wave Band stacked view' }
    ],
    description: 'Organic undulating liquid metal band with asymmetrical high-polish waves. Final clearance piece from the late summer capsule.',
    careInstructions: 'Avoid harsh household chemicals. Store in dry pouch.',
    materials: 'Recycled brass with heavy 18k yellow gold electroplate.',
    dimensions: 'Band height: 5 mm to 2 mm gradient',
    variants: [
      { sku: 'NSK-RNG-007-SZ7', colour: 'Polished Gold', size: 'US 7', sellable: 6, reserved: 0, available: 6, unitCostMinor: 52000 }
    ],
    stockBatches: [
      { batchId: 'BAT-202608-02', receivedDate: '2026-08-01', quantity: 20, remainingQty: 6, ageDays: 79, unitCostMinor: 52000, ageBucket: '61-90 days' }
    ]
  },
  {
    id: 'des-008',
    code: 'NSK-NCK-008',
    name: 'Solis Radiance Medallion Chain',
    slug: 'solis-radiance-medallion-chain',
    category: 'necklaces',
    categoryName: 'Necklaces & Pendants',
    collectionType: 'permanent',
    collectionName: 'Signature Permanent',
    lifecycle: 'active',
    publishState: 'published',
    salesUnit: 'piece',
    priceMinor: 289900, // ₹2,899.00
    currency: 'INR',
    rating: 5.0,
    reviewCount: 42,
    isNew: true,
    isBestSeller: true,
    launchDate: '2026-09-10',
    reviewDate: '2026-12-10',
    reorderPolicy: 'reorder_at_threshold',
    images: [
      { id: 'img-09', url: '/images/prodcuts/neakless-2.png', alt: 'Solis Radiance Medallion coin pendant on paperclip chain' },
      { id: 'img-09b', url: '/images/prodcuts/neackless-4.png', alt: 'Solis Radiance Medallion chain close-up' }
    ],
    description: 'Embossed sunburst coin medallion strung on an Italian paperclip chain. Finished with a decorative front toggle clasp.',
    careInstructions: 'Clean gently with jewellery polishing cloth.',
    materials: 'Stainless steel core with durable PVD 18k real gold coating (sweat-resistant).',
    dimensions: 'Chain length: 45 cm | Medallion diameter: 2.2 cm',
    variants: [
      { sku: 'NSK-NCK-008-45C', colour: 'Warm Gold', size: '45cm + Toggle', sellable: 16, reserved: 2, available: 14, unitCostMinor: 95000 }
    ],
    stockBatches: [
      { batchId: 'BAT-202609-15', receivedDate: '2026-09-10', quantity: 25, remainingQty: 16, ageDays: 39, unitCostMinor: 95000, ageBucket: '31-60 days' }
    ]
  }
];

// Dashboard Operational Fixtures
export const DASHBOARD_METRICS = {
  reportingPeriod: 'Last 30 Days (Provisional Timezone: Asia/Kolkata)',
  netSalesMinor: 48920000, // ₹4,89,200.00
  totalOrders: 184,
  outstandingPaymentsMinor: 3840000, // ₹38,400.00
  availableUnitsTotal: 285,
  unsoldStockCostMinor: 14280000, // ₹1,42,800.00
  pendingDispatches: 7,
  lowStockAlerts: 3,
  monthlyReviewsDue: 4,
  currency: 'INR'
};

export const STOCK_AGEING_SUMMARY = [
  { bucket: '0–30 Days', units: 114, costMinor: 5820000, percentage: 40.8 },
  { bucket: '31–60 Days', units: 58, costMinor: 3260000, percentage: 22.8 },
  { bucket: '61–90 Days', units: 36, costMinor: 1940000, percentage: 13.6 },
  { bucket: '91+ Days', units: 77, costMinor: 3260000, percentage: 22.8 }
];

export const MONTHLY_REVIEW_QUEUE = [
  {
    id: 'rev-001',
    designId: 'des-003',
    designCode: 'NSK-NCK-003',
    name: 'Nocturne Layered Velvet Choker',
    collection: 'Autumn Trend Edit (Monthly)',
    launchDate: '2026-09-18',
    reviewDueDate: '2026-10-18',
    daysSinceLaunch: 31,
    status: 'under_review',
    initialReceiptUnits: 15,
    netUnitsSold: 10,
    currentSellableUnits: 5,
    sellThroughRate: '66.7%',
    recommendedAction: 'Continue 30 days or transition to Clearance'
  },
  {
    id: 'rev-002',
    designId: 'des-007',
    designCode: 'NSK-RNG-007',
    name: 'Valeria Sculpted Wave Band',
    collection: 'Summer Trend Edit',
    launchDate: '2026-08-01',
    reviewDueDate: '2026-09-01',
    daysSinceLaunch: 79,
    status: 'clearance',
    initialReceiptUnits: 20,
    netUnitsSold: 14,
    currentSellableUnits: 6,
    sellThroughRate: '70.0%',
    recommendedAction: 'Final Clearance marked — Routine Reorder Blocked'
  },
  {
    id: 'rev-003',
    designId: 'des-005',
    designCode: 'NSK-NOS-005',
    name: 'Chandrika Pearl Nath & Chain',
    collection: 'Autumn Trend Edit (Monthly)',
    launchDate: '2026-10-05',
    reviewDueDate: '2026-11-04',
    daysSinceLaunch: 14,
    status: 'upcoming_review',
    initialReceiptUnits: 25,
    netUnitsSold: 1,
    currentSellableUnits: 24,
    sellThroughRate: '4.0%',
    recommendedAction: 'Review due in 16 days'
  }
];

export const DEMO_ORDERS = [
  {
    id: 'ord-1082',
    orderNumber: 'NSK-2026-1082',
    customerName: 'Aarohi Sen',
    customerEmail: 'aarohi.sen@example.com',
    itemsCount: 2,
    totalMinor: 439800,
    currency: 'INR',
    paymentStatus: 'PAID',
    fulfillmentStatus: 'PENDING_PICKING',
    date: '2026-10-19T10:15:00Z',
    itemsSummary: 'Aurelia Chandelier (1), Astrid Pavé (1)'
  },
  {
    id: 'ord-1081',
    orderNumber: 'NSK-2026-1081',
    customerName: 'Meera Kapur',
    customerEmail: 'meera.k@example.com',
    itemsCount: 1,
    totalMinor: 189900,
    currency: 'INR',
    paymentStatus: 'PAID',
    fulfillmentStatus: 'DISPATCHED',
    date: '2026-10-18T16:42:00Z',
    itemsSummary: 'Celeste Marquise Solitaire Band (1)'
  },
  {
    id: 'ord-1080',
    orderNumber: 'NSK-2026-1080',
    customerName: 'Priya Nambiar',
    customerEmail: 'priya.n@example.com',
    itemsCount: 1,
    totalMinor: 149900,
    currency: 'INR',
    paymentStatus: 'REFUNDED_RETURN',
    fulfillmentStatus: 'RETURNED_INSPECTED',
    date: '2026-10-17T11:20:00Z',
    itemsSummary: 'Seraphina Silk Scrunchie (1)'
  }
];

export const DEMO_TASKS = [
  {
    id: 'tsk-001',
    title: 'Conduct 30-Day Decision for Nocturne Velvet Choker',
    priority: 'HIGH',
    status: 'TODO',
    assignedTo: 'Collection Manager',
    dueDate: '2026-10-20',
    linkedRecord: 'Review rev-001'
  },
  {
    id: 'tsk-002',
    title: 'Inspect return batch RET-049 for Priya Nambiar',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    assignedTo: 'Inventory Lead',
    dueDate: '2026-10-20',
    linkedRecord: 'Return ord-1080'
  },
  {
    id: 'tsk-003',
    title: 'Pack Order NSK-2026-1082 for dispatch',
    priority: 'HIGH',
    status: 'TODO',
    assignedTo: 'Fulfillment Staff',
    dueDate: '2026-10-19',
    linkedRecord: 'Order ord-1082'
  }
];
