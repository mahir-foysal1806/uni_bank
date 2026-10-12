const express = require("express");

const {
  getQuestions,
  getMeta,
  getQuestion,
  createQuestion,
  downloadQuestion,
} = require("../controllers/questionController");

const { hideQuestion } = require("../controllers/reportController");
const adminAuth = require("../middleware/adminAuth");
const { singleUpload, verifyUploadSignature } = require("../middleware/upload");

const router = express.Router();

// GET /api/questions
router.get("/", getQuestions);

// GET /api/questions/meta (must come before /:id)
router.get("/meta", getMeta);

// POST /api/questions
router.post("/", singleUpload("file"), verifyUploadSignature, createQuestion);

// GET /api/questions/:id
router.get("/:id", getQuestion);

// GET /api/questions/:id/download
router.get("/:id/download", downloadQuestion);

// PATCH /api/questions/:id/hide (admin only)
router.patch("/:id/hide", adminAuth, hideQuestion);

module.exports = router;
