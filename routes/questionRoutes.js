const express = require("express");

const {
  getQuestions,
  getQuestion,
  createQuestion,
  downloadQuestion,
} = require("../controllers/questionController");

const upload = require("../middleware/upload");

const router = express.Router();

// GET /api/questions
router.get("/", getQuestions);

// POST /api/questions
router.post("/", upload.single("file"), createQuestion);

// GET /api/questions/:id
router.get("/:id", getQuestion);

// GET /api/questions/:id/download
router.get("/:id/download", downloadQuestion);

module.exports = router;
