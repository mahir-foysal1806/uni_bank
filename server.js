// server.js
// Main application entry point for UniQBank.
// Configures middleware, static folders, view engine, and mounts routes.

require('dotenv').config();

const express = require('express');
const path = require('path');
const fs = require('fs');

const questionRoutes = require('./routes/questionRoutes');
const pool = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// ---------------------------------------------------------------------------
// Ensure the uploads directory exists (important for fresh clones/deploys)
// ---------------------------------------------------------------------------
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ---------------------------------------------------------------------------
// View engine setup (EJS)
// ---------------------------------------------------------------------------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ---------------------------------------------------------------------------
// Core middleware
// ---------------------------------------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets (uploaded files, css, etc.) — no auth required, fully open.
app.use('/public', express.static(path.join(__dirname, 'public')));

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.use('/', questionRoutes);

// ---------------------------------------------------------------------------
// 404 handler
// ---------------------------------------------------------------------------
app.use((req, res) => {
  res.status(404).render('index', {
    questions: [],
    departments: [],
    semesters: [],
    filters: {},
    error: 'Page not found (404).',
  }).status(404);
});

// ---------------------------------------------------------------------------
// Centralized error handler
// ---------------------------------------------------------------------------
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).send(`
    <div style="font-family: sans-serif; padding: 40px; text-align: center;">
      <h1>Something went wrong</h1>
      <p>${process.env.NODE_ENV === 'development' ? err.message : 'Please try again later.'}</p>
      <a href="/">Go back home</a>
    </div>
  `);
});

// ---------------------------------------------------------------------------
// Start server (verify DB connectivity first, but don't hard-crash if it fails
// so the app can still boot and show a helpful error page)
// ---------------------------------------------------------------------------
pool.query('SELECT NOW()')
  .then(() => {
    console.log('✅ Connected to PostgreSQL database.');
  })
  .catch((err) => {
    console.error('⚠️  Could not connect to PostgreSQL at startup:', err.message);
    console.error('    Make sure DATABASE_URL is set and schema.sql has been run.');
  })
  .finally(() => {
    app.listen(PORT, () => {
      console.log(`🚀 UniQBank server running at http://localhost:${PORT}`);
    });
  });

module.exports = app;
