const { Pool } = require("pg");

/**
 * SSL: enabled in production unless DATABASE_SSL=false.
 * DATABASE_SSL_REJECT_UNAUTHORIZED=true enforces certificate validation
 * (default false because many managed hosts use provider-signed certs).
 */
const useSsl =
  process.env.DATABASE_SSL === "true" ||
  (process.env.NODE_ENV === "production" && process.env.DATABASE_SSL !== "false");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSsl
    ? { rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === "true" }
    : false,
  max: parseInt(process.env.DB_POOL_MAX, 10) || 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  statement_timeout: 15000,
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error:", error.code || error.name);
});

module.exports = pool;
