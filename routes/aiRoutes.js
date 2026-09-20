const express = require("express");
const router = express.Router();

const { chatWithAI } = require("../services/aiService");

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const reply = await chatWithAI(message);

    res.status(200).json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error("AI chat error:", error);

    res.status(500).json({
      success: false,
      message: "AI service failed",
      error: error.message,
    });
  }
});

module.exports = router;