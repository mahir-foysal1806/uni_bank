const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const path = require("path");
const fs = require("fs");

const { getAllowedOrigins } = require("./config/env");
const questionRoutes = require("./routes/questionRoutes");
const aiRoutes = require("./routes/aiRoutes");
const authRoutes = require("./routes/authRoutes");
const reportRoutes = require("./routes/reportRoutes");

function createApp() {
  const app = express();
  const isProd = process.env.NODE_ENV === "production";

  // Render sits behind a reverse proxy: needed for correct client IPs
  // (rate limiting).
  app.set("trust proxy", 1);
  app.disable("x-powered-by");

  app.use(helmet({ contentSecurityPolicy: false }));

  const allowedOrigins = getAllowedOrigins();

  app.use(
    cors({
      origin(origin, callback) {
        // Same-origin / non-browser clients send no Origin header.
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        const err = new Error("Origin not allowed");
        err.status = 403;
        return callback(err);
      },
      methods: ["GET", "POST", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: false,
      maxAge: 600,
    })
  );

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 300,
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req) => req.path === "/api/health",
    })
  );

  if (process.env.NODE_ENV !== "test") {
    app.use(morgan(isProd ? "tiny" : "dev"));
  }

  app.use(express.json({ limit: "50kb" }));
  app.use(express.urlencoded({ extended: true, limit: "50kb" }));

  // ---- API ----
  app.use("/api/auth", authRoutes);
  app.use("/api/questions", questionRoutes);
  app.use("/api/reports", reportRoutes);
  app.use("/api/ai", aiRoutes);

  // Liveness: no dependencies, answers immediately.
  app.get("/api/health", (req, res) => {
    res.status(200).json({ success: true, message: "UniQBank API is running", version: "2.1.0" });
  });

  // Readiness: verifies the database is reachable.
  app.get("/api/ready", async (req, res) => {
    try {
      const pool = require("./config/db");
      await pool.query("SELECT 1");
      res.status(200).json({ success: true, database: "ok" });
    } catch (error) {
      console.error("Readiness check failed:", error.code || error.name);
      res.status(503).json({ success: false, database: "unavailable" });
    }
  });

  app.get("/api/storage/health", async (req, res) => {
    try {
      await require("./services/storageService").testConnection();
      res.status(200).json({ success: true, message: "Storage connection successful" });
    } catch (error) {
      console.error("Storage health check failed:", error.name);
      res.status(503).json({ success: false, message: "Storage connection failed" });
    }
  });

  app.use("/api", (req, res) => {
    res.status(404).json({ success: false, message: "API route not found" });
  });

  // ---- Frontend (optional: only when frontend/dist was built) ----
  // robots.txt, sitemap.xml and the Google verification file live in
  // frontend/public and are copied into dist by Vite.
  const frontendPath = path.join(__dirname, "frontend", "dist");
  const indexFile = path.join(frontendPath, "index.html");

  if (fs.existsSync(indexFile)) {
    app.use(
      express.static(frontendPath, {
        index: false,
        setHeaders(res, filePath) {
          if (filePath.includes(`${path.sep}assets${path.sep}`)) {
            res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
          } else {
            res.setHeader("Cache-Control", "public, max-age=300");
          }
        },
      })
    );

    app.get("*", (req, res, next) => {
      // Missing files with an extension are real 404s, not SPA routes.
      if (path.extname(req.path)) return next();
      res.setHeader("Cache-Control", "no-cache");
      res.sendFile(indexFile, (err) => err && next(err));
    });
  }

  app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
  });

  // Central error handler: never leaks stack traces or internals.
  // eslint-disable-next-line no-unused-vars
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);

    if (error.type === "entity.parse.failed") {
      return res.status(400).json({ success: false, message: "Invalid JSON body." });
    }
    if (error.type === "entity.too.large") {
      return res.status(413).json({ success: false, message: "Request body too large." });
    }
    if (error.status === 403 && error.message === "Origin not allowed") {
      return res.status(403).json({ success: false, message: "Origin not allowed." });
    }

    console.error("Server error:", error.code || error.name, error.message && error.message.slice(0, 200));
    res.status(500).json({ success: false, message: "Internal server error" });
  });

  return app;
}

module.exports = createApp;
