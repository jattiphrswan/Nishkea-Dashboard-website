/**
 * NISHKÈA — Database Seeder
 * Populates RBAC roles, permissions, staff accounts, and initial categories.
 * Usage: node database/seed.js
 */

require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const { Pool } = require('pg');
const crypto = require('crypto');

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

async function seed() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('❌ Error: DATABASE_URL is not set.');
    process.exit(1);
  }

  const isLocalhost = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
  const pool = new Pool({
    connectionString,
    ssl: isLocalhost ? false : { rejectUnauthorized: false }
  });

  const client = await pool.connect();

  try {
    console.log('🌱 Starting database seeding...');
    await client.query('BEGIN');

    // 1. ROLES
    const roles = [
      { id: 'owner', name: 'Company Owner', description: 'Full access to all operations, settings, roles, and financial reports' },
      { id: 'manager', name: 'Operations Manager', description: 'Operations, collection reviews, adjustments, and team workflows' },
      { id: 'sales_support', name: 'Sales & Support', description: 'Order viewing, leads, and customer assistance; no supplier costs' },
      { id: 'inventory_staff', name: 'Inventory Specialist', description: 'Receipts, batch stock counts, and dispatches; no supplier costs or roles' },
      { id: 'accounts_staff', name: 'Accounts & Finance', description: 'Payment reconciliations, supplier dues, and financial reports' }
    ];

    for (const r of roles) {
      await client.query(`
        INSERT INTO roles (id, name, description)
        VALUES ($1, $2, $3)
        ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;
      `, [r.id, r.name, r.description]);
    }
    console.log(`✅ Seeded ${roles.length} roles.`);

    // 2. PERMISSIONS
    const permissions = [
      { id: 'product:create', action: 'product.create', description: 'Create draft product designs' },
      { id: 'product:edit', action: 'product.edit', description: 'Update product copy and options' },
      { id: 'product:publish', action: 'product.publish', description: 'Publish or unpublish catalogue items' },
      { id: 'inventory:view', action: 'inventory.view', description: 'View stock levels across locations' },
      { id: 'inventory:receive', action: 'inventory.receive', description: 'Create goods receipts and batches' },
      { id: 'inventory:adjust', action: 'inventory.adjust', description: 'Perform manual stock adjustments' },
      { id: 'inventory:transfer', action: 'inventory.transfer', description: 'Transfer stock between locations' },
      { id: 'cost:view', action: 'cost.view', description: 'View supplier costs and batch purchase prices' },
      { id: 'order:view', action: 'order.view', description: 'View customer orders and history' },
      { id: 'order:dispatch', action: 'order.dispatch', description: 'Mark orders as packed and dispatched' },
      { id: 'order:refund', action: 'order.refund', description: 'Process customer returns and refunds' },
      { id: 'review:decision', action: 'review.decision', description: 'Record 30-day collection decisions' },
      { id: 'report:view', action: 'report.view', description: 'View sales, ageing and margin reports' },
      { id: 'report:export', action: 'report.export', description: 'Export operational data to CSV/Excel' },
      { id: 'role:manage', action: 'role.manage', description: 'Administer staff roles and permissions' },
      { id: 'audit:view', action: 'audit.view', description: 'Inspect immutable system audit trail' }
    ];

    for (const p of permissions) {
      await client.query(`
        INSERT INTO permissions (id, action, description)
        VALUES ($1, $2, $3)
        ON CONFLICT (id) DO UPDATE SET action = EXCLUDED.action, description = EXCLUDED.description;
      `, [p.id, p.action, p.description]);
    }
    console.log(`✅ Seeded ${permissions.length} granular permissions.`);

    // 3. ROLE-PERMISSION MAPPING (Strict RBAC per docs/PERMISSIONS.md)
    const rolePermissionsMap = {
      owner: permissions.map(p => p.id),
      manager: [
        'product:create', 'product:edit', 'product:publish',
        'inventory:view', 'inventory:receive', 'inventory:adjust', 'inventory:transfer',
        'cost:view', 'order:view', 'order:dispatch', 'order:refund',
        'review:decision', 'report:view', 'report:export', 'audit:view'
      ],
      sales_support: [
        'order:view', 'product:create'
      ],
      inventory_staff: [
        'inventory:view', 'inventory:receive', 'inventory:adjust', 'inventory:transfer',
        'order:view', 'order:dispatch'
      ],
      accounts_staff: [
        'cost:view', 'order:view', 'order:refund', 'report:view', 'report:export'
      ]
    };

    for (const [roleId, permIds] of Object.entries(rolePermissionsMap)) {
      for (const permId of permIds) {
        await client.query(`
          INSERT INTO role_permissions (role_id, permission_id)
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING;
        `, [roleId, permId]);
      }
    }
    console.log('✅ Configured RBAC role-permission matrices.');

    // 4. SEED STAFF USERS
    const staffUsers = [
      { id: 'usr-owner-01', email: 'owner@nishkea.internal', name: 'Aadhya Sharma', roleId: 'owner' },
      { id: 'usr-mgr-01', email: 'manager@nishkea.internal', name: 'Kabir Mehta', roleId: 'manager' },
      { id: 'usr-inv-01', email: 'inventory@nishkea.internal', name: 'Rohit Verma', roleId: 'inventory_staff' },
      { id: 'usr-sales-01', email: 'sales@nishkea.internal', name: 'Ananya Roy', roleId: 'sales_support' }
    ];

    const defaultPassword = 'NishkeaDemoPassword2026!';
    const defaultHash = hashPassword(defaultPassword);

    for (const u of staffUsers) {
      await client.query(`
        INSERT INTO users (id, email, password_hash, name, role_id, status)
        VALUES ($1, $2, $3, $4, $5, 'ACTIVE')
        ON CONFLICT (email) DO UPDATE SET role_id = EXCLUDED.role_id, name = EXCLUDED.name;
      `, [u.id, u.email, defaultHash, u.name, u.roleId]);
    }
    console.log(`✅ Seeded ${staffUsers.length} initial staff accounts.`);

    // 5. SEED CATEGORIES
    const categories = [
      { id: 'cat-earrings', name: 'Earrings', slug: 'earrings', defaultSalesUnit: 'pair', desc: 'Chandelier drops, jhumkas, and studs sold by pair.' },
      { id: 'cat-rings', name: 'Rings', slug: 'rings', defaultSalesUnit: 'piece', desc: 'Cocktail bands and solitaires in US sizes.' },
      { id: 'cat-necklaces', name: 'Necklaces & Pendants', slug: 'necklaces', defaultSalesUnit: 'piece', desc: 'Tiered chokers and chains.' },
      { id: 'cat-hair-accessories', name: 'Hair Accessories', slug: 'hair-accessories', defaultSalesUnit: 'piece', desc: 'Silk scrunchies and headbands.' },
      { id: 'cat-nose-rings', name: 'Nose Rings & Pins', slug: 'nose-rings', defaultSalesUnit: 'piece', desc: 'Traditional naths and clips.' }
    ];

    for (const c of categories) {
      await client.query(`
        INSERT INTO categories (id, name, slug, description, default_sales_unit)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;
      `, [c.id, c.name, c.slug, c.desc, c.defaultSalesUnit]);
    }
    console.log(`✅ Seeded ${categories.length} core jewellery categories.`);

    await client.query('COMMIT');
    console.log('🎉 Seeding successfully finished!');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
