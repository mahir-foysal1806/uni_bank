// controllers/questionController.js
// Handles: rendering home/browse page, the upload form, processing uploads,
// search/filter logic, and serving file downloads. No authentication — fully open.

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');

const questionModel = require('../models/questionModel');

// ---------------------------------------------------------------------------
// Multer configuration — stores files on disk under public/uploads
// ---------------------------------------------------------------------------
const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'uploads');

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },

  filename: (req, file, cb) => {
    // Generate a collision-safe unique filename while preserving extension.
    const ext = path.extname(file.originalname).toLowerCase();

    const uniqueName = `${Date.now()}-${crypto
      .randomBytes(8)
      .toString('hex')}${ext}`;

    cb(null, uniqueName);
  },
});

function fileFilter(req, file, cb) {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Only PDF and image files (jpg, png, webp, gif) are allowed.'
      )
    );
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15 MB max
  },
});

// Export the multer middleware for a single field named "file"
const uploadMiddleware = upload.single('file');

// ---------------------------------------------------------------------------
// Department options
//
// These are only suggestions.
// Users can also type a completely new department.
//
// IMPORTANT:
// Do NOT use "Other" here.
// ---------------------------------------------------------------------------
const DEPARTMENT_OPTIONS = [
  'Computer Science & Engineering',
  'Electrical & Electronic Engineering',
  'Civil Engineering',
  'Mechanical Engineering',
  'Business Administration',
  'Economics',
  'English',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Law',
];

// ---------------------------------------------------------------------------
// Semester options
// ---------------------------------------------------------------------------
const SEMESTER_OPTIONS = [
  '1st Semester',
  '2nd Semester',
  '3rd Semester',
  '4th Semester',
  '5th Semester',
  '6th Semester',
  '7th Semester',
  '8th Semester',
];

// ---------------------------------------------------------------------------
// Exam type options
// ---------------------------------------------------------------------------
const EXAM_TYPE_OPTIONS = [
  'Midterm',
  'Final',
  'Quiz',
  'Class Test',
  'Assignment',
  'Other',
];

// ---------------------------------------------------------------------------
// Department normalization
//
// Examples:
//
// "cse"  -> "CSE"
// "CSE"  -> "CSE"
// "cSe"  -> "CSE"
// " cse " -> "CSE"
//
// Full department names are kept readable:
//
// "computer science and engineering"
// -> "Computer Science and Engineering"
//
// This helps keep uploaded department values consistent.
// ---------------------------------------------------------------------------

const DEPARTMENT_ALIASES = {
  cse: 'CSE',
  'computer science': 'Computer Science & Engineering',
  'computer science engineering': 'Computer Science & Engineering',
  'computer science & engineering': 'Computer Science & Engineering',

  eee: 'EEE',
  'electrical and electronic engineering':
    'Electrical & Electronic Engineering',
  'electrical & electronic engineering':
    'Electrical & Electronic Engineering',

  ce: 'CE',
  civil: 'Civil Engineering',
  'civil engineering': 'Civil Engineering',

  me: 'ME',
  mechanical: 'Mechanical Engineering',
  'mechanical engineering': 'Mechanical Engineering',

  bba: 'BBA',
  'business administration': 'Business Administration',

  eco: 'Economics',
  economics: 'Economics',

  english: 'English',

  math: 'Mathematics',
  maths: 'Mathematics',
  mathematics: 'Mathematics',

  physics: 'Physics',

  chemistry: 'Chemistry',

  law: 'Law',
};

function normalizeDepartment(value) {
  if (!value) {
    return '';
  }

  const cleaned = value
    .trim()
    .replace(/\s+/g, ' ');

  if (!cleaned) {
    return '';
  }

  const key = cleaned.toLowerCase();

  // If alias exists, use the standard value.
  if (DEPARTMENT_ALIASES[key]) {
    return DEPARTMENT_ALIASES[key];
  }

  // If it is a short code such as CSE / EEE / CE,
  // keep it uppercase.
  if (/^[a-z]{2,6}$/i.test(cleaned)) {
    return cleaned.toUpperCase();
  }

  // Otherwise keep the user's custom department name.
  return cleaned;
}

// ---------------------------------------------------------------------------
// GET / — Home / browse page with optional search & filters
// ---------------------------------------------------------------------------
async function renderHome(req, res, next) {
  try {
    const department = normalizeDepartment(req.query.department || '');
    const semester = (req.query.semester || '').trim();
    const keyword = (req.query.keyword || '').trim();

    const hasFilters = department || semester || keyword;

    let page = parseInt(req.query.page) || 1;

    if (page < 1) {
      page = 1;
    }

    const limit = 12;

    const questions = hasFilters
      ? await questionModel.searchQuestions({
          department,
          semester,
          keyword,
        })
      : await questionModel.getAllQuestions(page, limit);

    res.render('index', {
      questions,

      departments: DEPARTMENT_OPTIONS,

      semesters: SEMESTER_OPTIONS,

      filters: {
        department,
        semester,
        keyword,
      },

      page,
      limit,

      error: null,

      success: req.query.success || null,
    });

  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------------
// GET /upload — Render the upload form
// ---------------------------------------------------------------------------
function renderUploadForm(req, res) {
  res.render('upload', {
    departments: DEPARTMENT_OPTIONS,
    semesters: SEMESTER_OPTIONS,
    examTypes: EXAM_TYPE_OPTIONS,
    error: null,
  });
}

// ---------------------------------------------------------------------------
// POST /upload — Handle the multipart form submission
// ---------------------------------------------------------------------------
async function handleUpload(req, res, next) {
  // Run multer first; catch its errors gracefully.
  uploadMiddleware(req, res, async (multerErr) => {
    try {
      // ---------------------------------------------------------------
      // Multer error
      // ---------------------------------------------------------------
      if (multerErr) {
        return res.status(400).render('upload', {
          departments: DEPARTMENT_OPTIONS,
          semesters: SEMESTER_OPTIONS,
          examTypes: EXAM_TYPE_OPTIONS,
          error: multerErr.message || 'File upload failed.',
        });
      }

      // ---------------------------------------------------------------
      // Get form data
      // ---------------------------------------------------------------
      const {
        department,
        semester,
        courseCode,
        courseTitle,
        examType,
        sessionYear,
      } = req.body;

      // ---------------------------------------------------------------
      // File required
      // ---------------------------------------------------------------
      if (!req.file) {
        return res.status(400).render('upload', {
          departments: DEPARTMENT_OPTIONS,
          semesters: SEMESTER_OPTIONS,
          examTypes: EXAM_TYPE_OPTIONS,
          error: 'Please attach a PDF or image file.',
        });
      }

      // ---------------------------------------------------------------
      // Basic validation
      // ---------------------------------------------------------------
      if (
        !department ||
        !semester ||
        !courseCode ||
        !courseTitle ||
        !examType ||
        !sessionYear
      ) {
        // Clean up orphaned uploaded file.
        fs.unlink(req.file.path, () => {});

        return res.status(400).render('upload', {
          departments: DEPARTMENT_OPTIONS,
          semesters: SEMESTER_OPTIONS,
          examTypes: EXAM_TYPE_OPTIONS,
          error: 'All fields are required.',
        });
      }

      // ---------------------------------------------------------------
      // Normalize department
      // ---------------------------------------------------------------
      const normalizedDepartment = normalizeDepartment(department);

      if (!normalizedDepartment) {
        fs.unlink(req.file.path, () => {});

        return res.status(400).render('upload', {
          departments: DEPARTMENT_OPTIONS,
          semesters: SEMESTER_OPTIONS,
          examTypes: EXAM_TYPE_OPTIONS,
          error: 'Please enter a valid department.',
        });
      }

      // ---------------------------------------------------------------
      // Normalize other fields
      // ---------------------------------------------------------------
      const normalizedSemester = semester.trim();

      const normalizedCourseCode = courseCode
        .trim()
        .toUpperCase();

      const normalizedCourseTitle = courseTitle.trim();

      const normalizedExamType = examType.trim();

      const normalizedSessionYear = sessionYear.trim();

      // ---------------------------------------------------------------
      // Insert into database
      // ---------------------------------------------------------------
      await questionModel.insertQuestion({
        department: normalizedDepartment,

        semester: normalizedSemester,

        courseCode: normalizedCourseCode,

        courseTitle: normalizedCourseTitle,

        examType: normalizedExamType,

        sessionYear: normalizedSessionYear,

        fileName: req.file.filename,

        originalName: req.file.originalname,

        filePath: `/public/uploads/${req.file.filename}`,

        fileSize: req.file.size,
      });

      // ---------------------------------------------------------------
      // Redirect after successful upload
      // ---------------------------------------------------------------
      return res.redirect(
        '/?success=Question paper uploaded successfully!'
      );
    } catch (err) {
      // ---------------------------------------------------------------
      // If database insert fails, remove uploaded file.
      // ---------------------------------------------------------------
      if (req.file && req.file.path) {
        fs.unlink(req.file.path, () => {});
      }

      next(err);
    }
  });
}

// ---------------------------------------------------------------------------
// GET /download/:id — Serve the file and increment its download count
// ---------------------------------------------------------------------------
async function handleDownload(req, res, next) {
  try {
    const { id } = req.params;

    const question = await questionModel.getQuestionById(id);

    if (!question) {
      return res.status(404).send('Question paper not found.');
    }

    const absolutePath = path.join(
      __dirname,
      '..',
      question.file_path.replace('/public', 'public')
    );

    if (!fs.existsSync(absolutePath)) {
      return res
        .status(404)
        .send('File no longer exists on the server.');
    }

    // Fire-and-forget increment.
    questionModel
      .incrementDownloadCount(id)
      .catch((err) => {
        console.error(
          'Failed to increment download count:',
          err
        );
      });

    res.download(
      absolutePath,
      question.original_name
    );
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------
module.exports = {
  renderHome,
  renderUploadForm,
  handleUpload,
  handleDownload,
};