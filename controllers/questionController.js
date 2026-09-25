const {
  searchQuestions,
  getQuestionById,
  incrementDownloadCount,
  getDistinctDepartments,
  getDistinctSemesters,
  getDistinctExamTypes,
  getDistinctSessionYears,
  getDistinctCourseCodes,
  getDistinctCourseTitles,
  insertQuestion,
  findDuplicateQuestion,
  getFileNamesByCourseCode,
} = require("../models/questionModel");

const {
  uploadFile,
  downloadFile,
} = require("../services/storageService");

const fs = require("fs/promises");
const path = require("path");

/**
 * Fallback extension lookup, used only when the uploaded file's
 * original name has no extension at all (rare). Mirrors the
 * mimetypes already allowed in middleware/upload.js — this is a
 * safety net, not the primary extension source, so it does not
 * hard-code the system to a single file type.
 */
const MIME_EXTENSION_FALLBACK = {
  "application/pdf": ".pdf",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

/**
 * Convert a Course Code into a safe, filesystem-friendly base
 * filename: trimmed, with anything that isn't a letter, number,
 * dash or underscore replaced by an underscore.
 */
function buildSafeCourseCodeBase(courseCode) {
  const safe = String(courseCode || "")
    .trim()
    .replace(/[^a-zA-Z0-9-_]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return safe || "question";
}

/**
 * Detect the uploaded file's extension dynamically from its
 * original filename (NOT hard-coded to PDF only). Falls back to a
 * mimetype-based lookup only if the original filename has no
 * extension.
 */
function detectExtension(file) {
  const extFromName = path
    .extname(file.originalname || "")
    .toLowerCase();

  if (extFromName) {
    return extFromName;
  }

  return MIME_EXTENSION_FALLBACK[file.mimetype] || "";
}

/**
 * Build a unique stored filename of the form "<CourseCode><ext>",
 * falling back to "<CourseCode>-2<ext>", "<CourseCode>-3<ext>",
 * etc. when a question paper with the same Course Code and
 * extension already exists, so an existing stored file is never
 * silently overwritten. Different extensions for the same Course
 * Code (e.g. CSE1201.pdf and CSE1201.jpg) never collide.
 */
async function generateUniqueStoredFileName(courseCode, extension) {
  const base = buildSafeCourseCodeBase(courseCode);
  const existingNames = await getFileNamesByCourseCode(courseCode);
  const existingSet = new Set(existingNames);

  let candidate = `${base}${extension}`;
  let counter = 2;

  while (existingSet.has(candidate)) {
    candidate = `${base}-${counter}${extension}`;
    counter++;
  }

  return candidate;
}

/**
 * GET /api/questions
 * Advanced search + filter + pagination
 */
async function getQuestions(req, res, next) {
  try {
    const {
      keyword = "",
      department = "",
      semester = "",
      courseCode = "",
      examType = "",
      sessionYear = "",
      page = 1,
      limit = 12,
    } = req.query;

    const [
      result,
      departments,
      semesters,
      examTypes,
      sessionYears,
    ] = await Promise.all([
      searchQuestions({
        keyword,
        department,
        semester,
        courseCode,
        examType,
        sessionYear,
        page,
        limit,
      }),

      getDistinctDepartments(),
      getDistinctSemesters(),
      getDistinctExamTypes(),
      getDistinctSessionYears(),
    ]);

    res.json({
      success: true,
      data: {
        questions: result.questions,
        pagination: result.pagination,
        filters: {
          departments,
          semesters,
          examTypes,
          sessionYears,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/questions/meta
 * Returns suggestion lists (previously used values) for
 * autocomplete on the upload form: department, course code,
 * course title and session/year. Semester and exam type are
 * fixed dropdowns on the frontend so they aren't needed here.
 */
async function getMeta(req, res, next) {
  try {
    const [
      departments,
      sessionYears,
      courseCodes,
      courseTitles,
    ] = await Promise.all([
      getDistinctDepartments(),
      getDistinctSessionYears(),
      getDistinctCourseCodes(),
      getDistinctCourseTitles(),
    ]);

    res.json({
      success: true,
      data: {
        departments,
        sessionYears,
        courseCodes,
        courseTitles,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/questions/:id
 */
async function getQuestion(req, res, next) {
  try {
    const question = await getQuestionById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found.",
      });
    }

    res.json({
      success: true,
      data: question,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/questions
 */
async function createQuestion(req, res, next) {
  let uploadedToStorage = false;
  let storageKey = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "A PDF or image file is required.",
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

    const requiredFields = {
      department,
      semester,
      courseCode,
      courseTitle,
      examType,
      sessionYear,
    };

    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value || !String(value).trim()) {
        return res.status(400).json({
          success: false,
          message: `${field} is required.`,
        });
      }
    }

    /**
     * Block duplicate uploads: same department, semester,
     * course code, exam type and session year is treated as
     * the same question paper already existing in the system.
     */
    const duplicate = await findDuplicateQuestion({
      department,
      semester,
      courseCode,
      examType,
      sessionYear,
    });

    if (duplicate) {
      await fs.unlink(req.file.path).catch(() => {});

      return res.status(409).json({
        success: false,
        message:
          "This question paper already exists (same department, semester, course code, exam type and session year). Duplicate upload is not allowed.",
      });
    }

    /**
     * Stored filename = Course Code + original file extension,
     * made filesystem-safe, with a numeric suffix if that exact
     * name is already used by another question paper with the
     * same course code (so multiple papers per course code are
     * supported without overwriting each other).
     */
    const extension = detectExtension(req.file);

    const storedFileName = await generateUniqueStoredFileName(
      courseCode,
      extension
    );

    storageKey = `questions/${storedFileName}`;

    await uploadFile(
      req.file.path,
      storageKey,
      req.file.mimetype
    );

    uploadedToStorage = true;

    const question = await insertQuestion({
      department: department.trim(),
      semester: semester.trim(),
      courseCode: courseCode.trim(),
      courseTitle: courseTitle.trim(),
      examType: examType.trim(),
      sessionYear: sessionYear.trim(),
      fileName: storedFileName,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      storageKey,
    });

    await fs.unlink(req.file.path).catch(() => {});

    res.status(201).json({
      success: true,
      message: "Question uploaded successfully.",
      data: question,
    });
  } catch (error) {
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    if (uploadedToStorage && storageKey) {
      console.error(
        "Database insert failed after storage upload:",
        storageKey
      );
    }

    next(error);
  }
}

/**
 * GET /api/questions/:id/download
 */
async function downloadQuestion(req, res, next) {
  try {
    const question = await getQuestionById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found.",
      });
    }

    if (!question.storage_key) {
      return res.status(404).json({
        success: false,
        message: "File is not available.",
      });
    }

    await incrementDownloadCount(question.id);

    await downloadFile(
      question.storage_key,
      res,
      getContentType(question.original_name)
    );
  } catch (error) {
    console.error("Download error:", error);

    if (!res.headersSent) {
      next(error);
    }
  }
}

/**
 * Detect file content type
 */
function getContentType(fileName = "") {
  const extension = path.extname(fileName).toLowerCase();

  const types = {
    ".pdf": "application/pdf",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
  };

  return types[extension] || "application/octet-stream";
}

module.exports = {
  getQuestions,
  getMeta,
  getQuestion,
  createQuestion,
  downloadQuestion,
};