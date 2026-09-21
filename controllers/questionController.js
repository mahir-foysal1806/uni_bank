const {
  searchQuestions,
  getQuestionById,
  incrementDownloadCount,
  getDistinctDepartments,
  getDistinctSemesters,
  getDistinctExamTypes,
  getDistinctSessionYears,
  insertQuestion,
  findDuplicateQuestion,
} = require("../models/questionModel");

const {
  uploadFile,
  downloadFile,
} = require("../services/storageService");

const fs = require("fs/promises");
const path = require("path");

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

    storageKey = `questions/${Date.now()}-${req.file.filename}`;

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
      fileName: req.file.filename,
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
  getQuestion,
  createQuestion,
  downloadQuestion,
};
