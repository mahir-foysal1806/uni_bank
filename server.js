require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const path = require("path");

const questionRoutes = require("./routes/questionRoutes");
const aiRoutes = require("./routes/aiRoutes");
const { testConnection } = require("./services/storageService");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
helmet({
contentSecurityPolicy: false,
})
);

const allowedOrigins = [
"http://localhost:5173",
"http://127.0.0.1:5173",
"https://uni-bank-1.onrender.com",
process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
cors({
origin: function (origin, callback) {
if (!origin) {
return callback(null, true);
}

  if (allowedOrigins.includes(origin)) {
    return callback(null, true);
  }

  console.log("CORS blocked:", origin);
  return callback(new Error("CORS blocked"));
},
methods: [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "OPTIONS",
],
allowedHeaders: [
  "Content-Type",
  "Authorization",
],
credentials: false,

})
);

const limiter = rateLimit({
windowMs: 15 * 60 * 1000,
max: 300,
standardHeaders: true,
legacyHeaders: false,
});

app.use(limiter);
app.use(morgan("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/robots.txt", function (req, res) {
res.type("text/plain");

res.send(
"User-agent: *\n" +
"Allow: /\n\n" +
"Sitemap: https://uni-bank-1.onrender.com/sitemap.xml\n"
);
});

app.get("/sitemap.xml", function (req, res) {
res.type("application/xml");

res.send(
'<?xml version="1.0" encoding="UTF-8"?>' +
'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
"<url>" +
"<loc>https://uni-bank-1.onrender.com/</loc>" +
"<changefreq>weekly</changefreq>" +
"<priority>1.0</priority>" +
"</url>" +
"<url>" +
"<loc>https://uni-bank-1.onrender.com/questions</loc>" +
"<changefreq>daily</changefreq>" +
"<priority>0.9</priority>" +
"</url>" +
"</urlset>"
);
});

app.use("/api/questions", questionRoutes);
app.use("/api/ai", aiRoutes);

app.get("/api/health", function (req, res) {
res.status(200).json({
success: true,
message: "UniQBank API is running",
version: "2.0.0",
});
});

app.get("/api/storage/health", async function (req, res) {
try {
await testConnection();

res.status(200).json({
  success: true,
  message: "ElasticLake connection successful",
});

} catch (error) {
console.error("ElasticLake connection error:", error);

res.status(500).json({
  success: false,
  message: "ElasticLake connection failed",
  error:
    process.env.NODE_ENV === "development"
      ? error.message
      : "Storage connection failed",
});

}
});

const frontendPath = path.join(__dirname, "frontend", "dist");

app.use(express.static(frontendPath));

app.get("*", function (req, res, next) {
if (req.path.startsWith("/api/")) {
return next();
}

if (req.path === "/robots.txt") {
return next();
}

if (req.path === "/sitemap.xml") {
return next();
}

res.sendFile(
path.join(frontendPath, "index.html"),
function (error) {
if (error) {
next(error);
}
}
);
});

app.use("/api", function (req, res) {
res.status(404).json({
success: false,
message: "API route not found",
path: req.originalUrl,
});
});

app.use(function (req, res) {
res.status(404).json({
success: false,
message: "Route not found",
path: req.originalUrl,
});
});

app.use(function (error, req, res, next) {
console.error("Server error:", error);

if (res.headersSent) {
return next(error);
}

res.status(500).json({
success: false,
message: "Internal server error",
});
});

app.listen(PORT, "0.0.0.0", function () {
console.log("UniQBank server running on port " + PORT);
});
