const {
  getAllQuestions,
  searchQuestions,
  getQuestionById,
  incrementDownloadCount,
  getDistinctDepartments,
  getDistinctSemesters,
  insertQuestion,
} = require("../models/questionModel");

const {
  uploadFile,
  downloadFile,
} = require("../services/storageService");

const fs = require("fs/promises");
const path = require("path");

async function getQuestions(req, res, next) {
  try {
    const {
      department = "",
      semester = "",
      keyword = "",
      page = 1,
    } = req.query;

    const hasFilters = department || semester || keyword;

    const questions = hasFilters
      ? await searchQuestions({ department, semester, keyword })
      : await getAllQuestions(Number(page));

    const [departments, semesters] = await Promise.all([
      getDistinctDepartments(),
      getDistinctSemesters(),
    ]);

    res.json({
      success: true,
      data: {
        questions,
        departments,
        semesters,
        page: Number(page) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
}

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
