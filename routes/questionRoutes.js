// routes/questionRoutes.js
// Defines all application routes. No auth middleware anywhere — fully open access.

const express = require('express');
const router = express.Router();

const questionController = require('../controllers/questionController');

// Home / browse page — supports ?department=&semester=&keyword= query filters
router.get('/', questionController.renderHome);

// Upload form (GET) and submission (POST)
router.get('/upload', questionController.renderUploadForm);
router.post('/upload', questionController.handleUpload);

// Instant download by question ID
router.get('/download/:id', questionController.handleDownload);

module.exports = router;
