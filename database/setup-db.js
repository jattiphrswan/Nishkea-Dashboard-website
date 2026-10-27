/**
 * NISHKÈA — Comprehensive Database Setup
 * Usage: node database/setup-db.js (or npm run db:setup)
 *
 * Sequentially executes:
 * 1. Database connection verification
 * 2. Unapplied migrations execution (001 through 005)
 * 3. Seed initialization (RBAC roles, permissions, staff accounts, jewellery categories)
 * 4. Verification of table structure and constraints
 */

require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const { runMigrations } = require('./migrate');
const { seed } = require('./seed');
const { verifyConnection } = require('./verify-connection');

async function setupDatabase() {
  console.log('==================================================================');
  console.log('NISHKÈA: Cloud Database Automated Setup & Initialization');
  console.log('==================================================================\n');

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ Error: DATABASE_URL is not set in environment or .env.local\n');
    console.log('Please create .env.local with your Cloud PostgreSQL URL:');
    console.log('  DATABASE_URL="postgresql://[user]:[password]@[host]/[dbname]?sslmode=require"\n');
    process.exit(1);
  }

  try {
    // Step 1: Run Migrations
    console.log('[Step 1/3]: Executing database schema migrations...');
    await runMigrations();

    // Step 2: Seed Core Data
    console.log('\n[Step 2/3]: Seeding initial RBAC roles, staff, and categories...');
    await seed();

    // Step 3: Run Full Verification Telemetry
    console.log('\n[Step 3/3]: Verifying database readiness & tables...');
    await verifyConnection();

    console.log('🌟 DATABASE SETUP COMPLETED SUCCESSFULLY!');
    console.log('You are now ready to run the application in production mode.\n');
  } catch (err) {
    console.error('\n❌ Database setup encountered an error:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };
