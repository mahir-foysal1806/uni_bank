const express = require("express");
const rateLimit = require("express-rate-limit");

const {
  createReport,
  getReports,
  getStats,
  reviewReport,
} = require("../controllers/reportController");

const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

/**
 * Extra-strict rate limit just for report submission, so one
 * person can't spam reports and flood the moderation queue.
 */
const reportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many reports submitted. Please try again later.",
  },
});

// POST /api/reports (public, no login required)
router.post("/", reportLimiter, createReport);

// GET /api/reports/stats (admin) — must come before /:id-style routes
router.get("/stats", adminAuth, getStats);

// GET /api/reports (admin)
router.get("/", adminAuth, getReports);

// PATCH /api/reports/:id (admin)
router.patch("/:id", adminAuth, reviewReport);

module.exports = router;
