const express = require("express");
const rateLimit = require("express-rate-limit");

const { chatWithAI, AIConfigError } = require("../services/aiService");

const router = express.Router();

const MAX_MESSAGE_LENGTH = 2000;

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many AI requests. Please try again later." },
});

// POST /api/ai/chat
router.post("/chat", aiLimiter, async (req, res) => {
  const message = req.body && req.body.message;

  if (typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ success: false, message: "Message is required" });
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({
      success: false,
      message: `Message must be at most ${MAX_MESSAGE_LENGTH} characters.`,
    });
  }

  try {
    const reply = await chatWithAI(message);
    res.status(200).json({ success: true, reply });
  } catch (error) {
    console.error("AI chat error:", error.name, error.status || "");

    if (error instanceof AIConfigError) {
      return res.status(503).json({
        success: false,
        message: "The AI assistant is not configured on this server.",
      });
    }

    res.status(502).json({
      success: false,
      message: "The AI assistant is temporarily unavailable. Please try again.",
    });
  }
});

module.exports = router;
