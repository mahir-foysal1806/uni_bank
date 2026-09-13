// config/db.js
// PostgreSQL connection pool setup using `pg` and process.env.DATABASE_URL.
// Works locally (.env file) and on Render/Railway (env vars injected by platform).

const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.warn(
    '⚠️  DATABASE_URL is not set. Add it to your .env file or your hosting provider\'s env vars.'
  );
}

// Render/Railway managed Postgres typically requires SSL in production,
// but local Postgres usually does not support/require it.
const useSSL = process.env.DATABASE_URL && process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSSL ? { rejectUnauthorized: false } : false,
  max: 10, // max number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  // Handles idle client errors so the whole process doesn't crash.
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

module.exports = pool;
