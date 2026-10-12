const jwt = require("jsonwebtoken");
const { getJwtSecret } = require("../config/env");

/**
 * Protects admin-only routes. Expects: Authorization: Bearer <token>
 */
function adminAuth(req, res, next) {
  const [scheme, token] = (req.headers.authorization || "").split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ success: false, message: "Admin authentication required." });
  }

  let secret;
  try {
    secret = getJwtSecret();
  } catch {
    console.error("Admin auth unavailable: ADMIN_JWT_SECRET is not configured.");
    return res.status(500).json({ success: false, message: "Admin authentication is not configured." });
  }

  try {
    const payload = jwt.verify(token, secret, { algorithms: ["HS256"] });
    if (payload.role !== "admin") throw new Error("not admin");
    req.admin = payload;
    return next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired admin session. Please log in again.",
    });
  }
}

module.exports = adminAuth;
