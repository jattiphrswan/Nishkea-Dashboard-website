/**
 * Database Client Module — Node 3
 * Connects to Cloud PostgreSQL (Neon / Supabase) via pg.Pool.
 * Handles serverless lifecycle, connection pooling, and graceful fallback.
 */

import { Pool } from 'pg';

let pool = null;

export function getDbPool() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    return null;
  }

  if (!pool) {
    const isLocalhost = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

    pool = new Pool({
      connectionString,
      ssl: isLocalhost ? false : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on('error', (err) => {
      console.error('[PostgreSQL Pool Error]:', err.message);
    });
  }

  return pool;
}

/**
 * Execute a parameterized SQL query
 * @param {string} text - SQL query string
 * @param {Array} params - Query parameters
 */
export async function query(text, params = []) {
  const p = getDbPool();
  if (!p) {
    throw new Error('DATABASE_URL is not configured in environment.');
  }

  const start = Date.now();
  const res = await p.query(text, params);
  const duration = Date.now() - start;

  if (process.env.NODE_ENV === 'development') {
    // Debug log in dev mode
    console.debug('[SQL Executed]:', { text: text.slice(0, 100), durationMs: duration, rows: res.rowCount });
  }

  return res;
}

/**
 * Execute queries inside an isolated ACID transaction
 * @param {Function} callback - Async function receiving (client)
 */
export async function withTransaction(callback) {
  const p = getDbPool();
  if (!p) {
    throw new Error('DATABASE_URL is not configured in environment.');
  }

  const client = await p.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Test database connectivity
 */
export async function testConnection() {
  const p = getDbPool();
  if (!p) {
    return {
      connected: false,
      message: 'DATABASE_URL is not defined in environment variables.'
    };
  }

  try {
    const res = await p.query('SELECT NOW() as current_time, version() as pg_version');
    return {
      connected: true,
      time: res.rows[0].current_time,
      version: res.rows[0].pg_version
    };
  } catch (err) {
    return {
      connected: false,
      error: err.message
    };
  }
}
