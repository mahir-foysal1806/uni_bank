const jwt = require("jsonwebtoken");

/**
 * Protects admin-only routes (moderation dashboard APIs).
 * Expects: Authorization: Bearer <token>
 */
function adminAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      success: false,
      message: "Admin authentication required.",
    });
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.ADMIN_JWT_SECRET || "dev-only-secret-change-me"
    );

    if (payload.role !== "admin") {
      throw new Error("Not an admin token");
    }

    req.admin = payload;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired admin session. Please log in again.",
    });
  }
}

module.exports = adminAuth;
