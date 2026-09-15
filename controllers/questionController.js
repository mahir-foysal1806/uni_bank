// controllers/questionController.js
// Handles: rendering home/browse page, the upload form, processing uploads,
// search/filter logic, and serving file downloads. No authentication — fully open.

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');

const questionModel = require('../models/questionModel');
const { uploadFile, downloadFile } = require('../services/driveService');

// Multer config stores temporary files under public/uploads
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
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
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
    fileSize: 15 * 1024 * 1024,
  },
});

const uploadMiddleware = upload.single('file');

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

const EXAM_TYPE_OPTIONS = [
  'Midterm',
  'Final',
  'Quiz',
  'Class Test',
  'Assignment',
  'Other',
];

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
  if (!value) return '';

  const cleaned = value.trim().replace(/\s+/g, ' ');

  if (!cleaned) return '';

  const key = cleaned.toLowerCase();

  if (DEPARTMENT_ALIASES[key]) {
    return DEPARTMENT_ALIASES[key];
  }

  if (/^[a-z]{2,6}$/i.test(cleaned)) {
    return cleaned.toUpperCase();
  }

  return cleaned;
}

async function renderHome(req, res, next) {
  try {
    const department = normalizeDepartment(
      req.query.department || ''
    );

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

function renderUploadForm(req, res) {
  res.render('upload', {
    departments: DEPARTMENT_OPTIONS,
    semesters: SEMESTER_OPTIONS,
    examTypes: EXAM_TYPE_OPTIONS,
    error: null,
  });
}

async function handleUpload(req, res, next) {
  uploadMiddleware(req, res, async (multerErr) => {
    try {
      if (multerErr) {
        return res.status(400).render('upload', {
          departments: DEPARTMENT_OPTIONS,
          semesters: SEMESTER_OPTIONS,
          examTypes: EXAM_TYPE_OPTIONS,
          error: multerErr.message || 'File upload failed.',
        });
      }

      const {
        department,
        semester,
        courseCode,
        courseTitle,
        examType,
        sessionYear,
      } = req.body;

      if (!req.file) {
        return res.status(400).render('upload', {
          departments: DEPARTMENT_OPTIONS,
          semesters: SEMESTER_OPTIONS,
          examTypes: EXAM_TYPE_OPTIONS,
          error: 'Please attach a PDF or image file.',
        });
      }

      if (
        !department ||
        !semester ||
        !courseCode ||
        !courseTitle ||
        !examType ||
        !sessionYear
      ) {
        fs.unlink(req.file.path, () => {});

        return res.status(400).render('upload', {
          departments: DEPARTMENT_OPTIONS,
          semesters: SEMESTER_OPTIONS,
          examTypes: EXAM_TYPE_OPTIONS,
          error: 'All fields are required.',
        });
      }

      const normalizedDepartment =
        normalizeDepartment(department);

      if (!normalizedDepartment) {
        fs.unlink(req.file.path, () => {});

        return res.status(400).render('upload', {
          departments: DEPARTMENT_OPTIONS,
          semesters: SEMESTER_OPTIONS,
          examTypes: EXAM_TYPE_OPTIONS,
          error: 'Please enter a valid department.',
        });
      }

      const normalizedSemester = semester.trim();
      const normalizedCourseCode =
        courseCode.trim().toUpperCase();
      const normalizedCourseTitle = courseTitle.trim();
      const normalizedExamType = examType.trim();
      const normalizedSessionYear = sessionYear.trim();

      // ==========================================
      // Upload file to Google Drive
      // ==========================================

      const driveFile = await uploadFile(
        req.file.path,
        req.file.originalname,
        req.file.mimetype
      );

      // ==========================================
      // Save question information to PostgreSQL
      // ==========================================

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

        // Google Drive information
        driveFileId: driveFile.id,
        driveWebViewLink: driveFile.webViewLink || null,
      });

      // ==========================================
      // Delete temporary local file
      // ==========================================

      fs.unlink(req.file.path, () => {});

      return res.redirect(
        '/?success=Question paper uploaded successfully!'
      );
    } catch (err) {
      if (req.file && req.file.path) {
        fs.unlink(req.file.path, () => {});
      }

      next(err);
    }
  });
}

async function handleDownload(req, res, next) {
  try {
    const { id } = req.params;

    const question = await questionModel.getQuestionById(id);

    if (!question) {
      return res.status(404).send(
        'Question paper not found.'
      );
    }

    // Make sure Google Drive file exists
    if (!question.drive_file_id) {
      return res.status(404).send(
        'File is not available on Google Drive.'
      );
    }

    // Increase download count
    questionModel
      .incrementDownloadCount(id)
      .catch((err) => {
        console.error(
          'Failed to increment download count:',
          err
        );
      });

    // Keep original filename when downloading
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${question.original_name}"`
    );

    // Download file from Google Drive
    await downloadFile(
      question.drive_file_id,
      res
    );
  } catch (err) {
    next(err);
  }
}

module.exports = {
  renderHome,
  renderUploadForm,
  handleUpload,
  handleDownload,
};