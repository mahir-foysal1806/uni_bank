const express = require("express");
const rateLimit = require("express-rate-limit");

const { adminLogin } = require("../controllers/authController");

const router = express.Router();

/**
 * Slow down brute-force password guessing on the admin login.
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Please try again later.",
  },
});

// POST /api/auth/admin-login
router.post("/admin-login", loginLimiter, adminLogin);

module.exports = router;
