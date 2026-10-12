/**
 * Central environment helpers. No fallback secrets: missing
 * security-critical values fail closed.
 */
function getJwtSecret() {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "ADMIN_JWT_SECRET must be set to a random string of at least 32 characters."
    );
  }
  return secret;
}

function getAllowedOrigins() {
  const origins = ["http://localhost:5173", "http://127.0.0.1:5173"];
  const extra = [process.env.FRONTEND_URL, ...(process.env.CORS_ORIGINS || "").split(",")]
    .map((o) => (o || "").trim().replace(/\/$/, ""))
    .filter(Boolean);
  return [...new Set([...origins, ...extra])];
}

module.exports = { getJwtSecret, getAllowedOrigins };
