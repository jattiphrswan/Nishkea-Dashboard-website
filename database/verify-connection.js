/**
 * NISHKÈA — Cloud Database Connection & Readiness Verifier
 * Usage: node database/verify-connection.js (or npm run db:verify)
 *
 * Verifies live PostgreSQL connection, checks migration status,
 * and reports health metrics without exposing secrets or passwords.
 */

require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const { Pool } = require('pg');

function maskConnectionString(url) {
  if (!url) return 'NOT_CONFIGURED';
  try {
    const parsed = new URL(url);
    if (parsed.password) {
      parsed.password = '••••••••';
    }
    return parsed.toString();
  } catch {
    return 'CONFIGURED_CUSTOM_STRING (Masked)';
  }
}

async function verifyConnection() {
  const connectionString = process.env.DATABASE_URL;

  console.log('==================================================================');
  console.log('NISHKÈA: Cloud PostgreSQL Connection & Readiness Verifier');
  console.log('==================================================================\n');

  if (!connectionString) {
    console.log('⚠️  DATABASE_URL is not configured in .env.local or process environment.');
    console.log('\nTo connect Cloud PostgreSQL:');
    console.log('  1. Create a free PostgreSQL instance on Neon (https://neon.tech) or Supabase (https://supabase.com).');
    console.log('  2. Copy your connection URI (e.g., postgresql://neondb_owner:***@ep-xyz.neon.tech/neondb?sslmode=require).');
    console.log('  3. Create .env.local in project root:');
    console.log('     DATABASE_URL=your_connection_string_here');
    console.log('  4. Run migrations and initial seed:');
    console.log('     npm run db:setup');
    console.log('==================================================================\n');
    return { connected: false, reason: 'MISSING_ENV' };
  }

  console.log(`📡 Target Database URI: ${maskConnectionString(connectionString)}`);

  const isLocalhost = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
  const pool = new Pool({
    connectionString,
    ssl: isLocalhost ? false : { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000
  });

  const start = Date.now();
  try {
    const client = await pool.connect();
    const connectDuration = Date.now() - start;

    console.log(`✅ Successfully connected in ${connectDuration}ms!`);

    // 1. Query Server & DB Details
    const versionRes = await client.query('SELECT version() as pg_version, current_database() as db_name, current_user as db_user');
    const { pg_version, db_name, db_user } = versionRes.rows[0];

    console.log(`\n--- PostgreSQL Telemetry ---`);
    console.log(`• Database Name: ${db_name}`);
    console.log(`• Database User: ${db_user}`);
    console.log(`• Engine Version: ${pg_version.split(',')[0]}`);
    console.log(`• Round-Trip Ping: ${connectDuration}ms`);

    // 2. Check Migrations
    let appliedMigrations = [];
    const migrationsTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'schema_migrations'
      ) as exists;
    `);

    if (migrationsTableCheck.rows[0].exists) {
      const migRes = await client.query('SELECT filename, applied_at FROM schema_migrations ORDER BY id ASC');
      appliedMigrations = migRes.rows;
      console.log(`\n--- Schema Migrations (${appliedMigrations.length}/5 Applied) ---`);
      for (const m of appliedMigrations) {
        console.log(`  ✓ ${m.filename} (Applied: ${new Date(m.applied_at).toLocaleString()})`);
      }
    } else {
      console.log('\n⚠️  Table "schema_migrations" does not exist yet. Run: npm run db:migrate');
    }

    // 3. Count Core Records
    console.log(`\n--- Operational Entity Counts ---`);
    const tables = ['users', 'roles', 'permissions', 'categories', 'product_designs', 'stock_batches', 'orders', 'crm_leads'];
    for (const tbl of tables) {
      try {
        const countRes = await client.query(`SELECT count(*) as cnt FROM ${tbl}`);
        console.log(`• ${tbl.padEnd(18)}: ${countRes.rows[0].cnt} records`);
      } catch {
        console.log(`• ${tbl.padEnd(18)}: (Table not created yet)`);
      }
    }

    client.release();
    await pool.end();

    console.log('\n==================================================================');
    console.log('🌟 CLOUD POSTGRESQL VERIFICATION COMPLETE!');
    console.log('==================================================================\n');
    return { connected: true, latencyMs: connectDuration };
  } catch (err) {
    console.error(`\n❌ PostgreSQL Connection Error:`, err.message);
    console.log('\nTroubleshooting Tips:');
    console.log('  - Ensure ?sslmode=require is present in your connection string for Neon / Supabase.');
    console.log('  - Verify IP access restrictions on your cloud database provider.');
    console.log('  - Confirm the password and database name are correct.');
    console.log('==================================================================\n');
    await pool.end().catch(() => {});
    return { connected: false, error: err.message };
  }
}

if (require.main === module) {
  verifyConnection();
}

module.exports = { verifyConnection, maskConnectionString };
