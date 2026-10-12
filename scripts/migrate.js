/**
 * Applies SQL files in ./migrations in filename order.
 * Every migration is idempotent. Run explicitly:  npm run migrate
 * (never runs automatically on server start).
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const pool = require("../config/db");

async function main() {
  const dir = path.join(__dirname, "..", "migrations");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(dir, file), "utf8");
    console.log("Applying", file);
    await pool.query(sql);
  }
  console.log("Migrations complete.");
}

main()
  .catch((error) => {
    console.error("Migration failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
