const {
  REPORT_REASONS,
  REPORT_STATUSES,
  insertReport,
  listReports,
  getReportById,
  getReportStatusCounts,
  updateReportStatus,
} = require("../models/reportModel");

const {
  getQuestionById,
  setQuestionHidden,
} = require("../models/questionModel");

/**
 * POST /api/reports  (public — no login required)
 * body: { questionId, reason, description }
 */
async function createReport(req, res, next) {
  try {
    const { questionId, reason, description } = req.body || {};

    if (!questionId || !Number.isFinite(Number(questionId))) {
      return res.status(400).json({
        success: false,
        message: "A valid questionId is required.",
      });
    }

    if (!reason || !REPORT_REASONS.includes(reason)) {
      return res.status(400).json({
        success: false,
        message: `reason must be one of: ${REPORT_REASONS.join(", ")}`,
      });
    }

    const question = await getQuestionById(Number(questionId));

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question paper not found.",
      });
    }

    if (typeof description === "string" && description.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "description must be under 1000 characters.",
      });
    }

    const report = await insertReport({
      questionId: Number(questionId),
      reason,
      description,
    });

    res.status(201).json({
      success: true,
      message: "Thanks — your report has been submitted for review.",
      data: report,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/reports  (admin only)
 * query: ?status=pending&page=1&limit=20
 */
async function getReports(req, res, next) {
  try {
    const { status = "", page = 1, limit = 20 } = req.query;

    if (status && !REPORT_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `status must be one of: ${REPORT_STATUSES.join(", ")}`,
      });
    }

    const result = await listReports({ status, page, limit });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/reports/stats  (admin only)
 */
async function getStats(req, res, next) {
  try {
    const counts = await getReportStatusCounts();

    res.json({
      success: true,
      data: counts,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/reports/:id  (admin only)
 * body: { status: "resolved" | "dismissed", reviewNote }
 * Marks the report reviewed. Does NOT touch the question —
 * use PATCH /api/questions/:id/hide for that, as a separate,
 * explicit action.
 */
async function reviewReport(req, res, next) {
  try {
    const { id } = req.params;
    const { status, reviewNote } = req.body || {};

    if (!["resolved", "dismissed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'status must be "resolved" or "dismissed".',
      });
    }

    const existing = await getReportById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Report not found.",
      });
    }

    const updated = await updateReportStatus(id, {
      status,
      reviewedBy: req.admin?.role || "admin",
      reviewNote,
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/questions/:id/hide  (admin only)
 * body: { hidden: true | false }
 * Soft-removes (or restores) a question after moderation —
 * the row is kept, only excluded from public search.
 */
async function hideQuestion(req, res, next) {
  try {
    const { id } = req.params;
    const { hidden } = req.body || {};

    const question = await getQuestionById(id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question paper not found.",
      });
    }

    const updated = await setQuestionHidden(id, hidden !== false);

    res.json({
      success: true,
      message: updated.is_hidden
        ? "Question paper hidden from public search."
        : "Question paper restored to public search.",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createReport,
  getReports,
  getStats,
  reviewReport,
  hideQuestion,
};
