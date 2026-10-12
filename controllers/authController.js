const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { getJwtSecret } = require("../config/env");

/**
 * Constant-time string comparison, so checking the admin
 * password doesn't leak timing information.
 */
function safeCompare(a, b) {
  const bufferA = Buffer.from(String(a));
  const bufferB = Buffer.from(String(b));

  if (bufferA.length !== bufferB.length) {
    // Still run a comparison so the response time doesn't
    // reveal the correct password's length.
    crypto.timingSafeEqual(bufferA, bufferA);
    return false;
  }

  return crypto.timingSafeEqual(bufferA, bufferB);
}

/**
 * POST /api/auth/admin-login
 * body: { password }
 */
async function adminLogin(req, res) {
  const { password } = req.body || {};
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.error(
      "ADMIN_PASSWORD is not set in the environment. Admin login is disabled."
    );

    return res.status(500).json({
      success: false,
      message: "Admin login is not configured on the server.",
    });
  }

  if (typeof password !== "string" || !password || !safeCompare(password, adminPassword)) {
    return res.status(401).json({
      success: false,
      message: "Incorrect password.",
    });
  }

  let secret;
  try {
    secret = getJwtSecret();
  } catch {
    console.error("ADMIN_JWT_SECRET is not configured. Admin login is disabled.");
    return res.status(500).json({
      success: false,
      message: "Admin login is not configured on the server.",
    });
  }

  const token = jwt.sign({ role: "admin" }, secret, {
    expiresIn: "12h",
    algorithm: "HS256",
  });

  res.json({
    success: true,
    data: { token },
  });
}

module.exports = { adminLogin };
