/**
 * NISHKÈA — Database Migration Runner
 * Executes SQL migrations sequentially and records them in schema_migrations table.
 * Usage: node database/migrate.js
 */

require('dotenv').config({ path: '.env.local' });
require('dotenv').config(); // Fallback to .env

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

async function runMigrations() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('❌ Error: DATABASE_URL is not set in environment or .env.local');
    process.exit(1);
  }

  const isLocalhost = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
  const pool = new Pool({
    connectionString,
    ssl: isLocalhost ? false : { rejectUnauthorized: false }
  });

  const client = await pool.connect();

  try {
    console.log('🔄 Checking database connection...');
    await client.query('SELECT 1');
    console.log('✅ Connected to PostgreSQL successfully.');

    // Create migrations tracker table
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    console.log(`📂 Found ${files.length} migration file(s).`);

    for (const file of files) {
      const checkRes = await client.query(
        'SELECT id FROM schema_migrations WHERE filename = $1',
        [file]
      );

      if (checkRes.rowCount > 0) {
        console.log(`⏩ Skipping already applied migration: ${file}`);
        continue;
      }

      console.log(`⚡ Applying migration: ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
      await client.query('COMMIT');

      console.log(`✅ Applied migration: ${file}`);
    }

    console.log('🎉 All migrations completed successfully.');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('❌ Migration failed:', err.message);
    if (require.main === module) {
      process.exit(1);
    }
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };
