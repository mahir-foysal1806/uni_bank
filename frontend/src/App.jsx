import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import "./index.css";
import AIChat from "./components/AIChat";
import ReportModal from "./components/ReportModal";
import AdminLogin from "./components/AdminLogin";
import AdminModeration from "./components/AdminModeration";
import Seo from "./components/Seo";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";


// ============================================================
// API HELPER
// ============================================================

async function apiRequest(url, options = {}) {
  const response = await fetch(url, options);

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        `Request failed with status ${response.status}`
    );
  }

  return data;
}


// ============================================================
// NAVBAR
// ============================================================

function Navbar() {
  const location = useLocation();

  const links = [
    {
      label: "Home",
      path: "/",
    },
    {
      label: "Questions",
      path: "/questions",
    },
    {
      label: "Notes",
      path: "/notes",
    },
    {
      label: "Books",
      path: "/books",
    },
    {
      label: "Syllabus",
      path: "/syllabus",
    },
    {
      label: "AI Assistant",
      path: "/ai",
    },
  ];

  return (
    <header className="navbar">
      <div className="container nav-inner">

        {/* LOGO */}

        <Link to="/" className="logo">
          UniQBank
        </Link>


        {/* NAVIGATION */}

        <nav className="nav-links">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `nav-link ${
                  isActive ||
                  (link.path === "/" &&
                    location.pathname === "/")
                    ? "active"
                    : ""
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>


        {/* UPLOAD */}

        <Link
          to="/upload"
          className="upload-btn"
        >
          + Upload
        </Link>

      </div>
    </header>
  );
}


// ============================================================
// FOOTER
// ============================================================

function Footer() {
  return (
    <footer>
      <div className="container footer-inner">

        <div>
          <Link
            to="/"
            className="logo"
          >
            UniQBank
          </Link>

          <p>
            A simple university resource platform
            for students.
          </p>
        </div>


        <div className="footer-links">

          <Link to="/">
            Home
          </Link>

          <Link to="/questions">
            Questions
          </Link>

          <Link to="/notes">
            Notes
          </Link>

          <Link to="/books">
            Books
          </Link>

          <Link to="/syllabus">
            Syllabus
          </Link>

          <Link to="/ai">
            AI Assistant
          </Link>

          <Link to="/upload">
            Upload
          </Link>

        </div>

      </div>


      <div className="container copyright">
        © {new Date().getFullYear()} UniQBank.
        All rights reserved.
      </div>
    </footer>
  );
}


// ============================================================
// LAYOUT
// ============================================================

function Layout({ children }) {
  return (
    <>
      <Navbar />

      <main>
        {children}
      </main>

      <Footer />
    </>
  );
}


// ============================================================
// HOME
// ============================================================

function Home() {
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");


  const searchQuestions = (event) => {
    event.preventDefault();

    const value = keyword.trim();

    if (value) {
      navigate(
        `/questions?keyword=${encodeURIComponent(
          value
        )}`
      );
    } else {
      navigate("/questions");
    }
  };


  return (
    <>

      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="hero">

        <div className="container hero-content">

          <div className="hero-text">

            <span className="hero-badge">
              UNIVERSITY RESOURCE PLATFORM
            </span>


            <h1>
              Everything you need
              <br />
              <span>for university.</span>
            </h1>


            <p>
              Find past question papers, lecture notes,
              books and syllabus materials in one simple
              place.
            </p>


            {/* HERO ACTIONS */}

            <div className="hero-actions">

              <Link
                to="/questions"
                className="primary-btn"
              >
                Browse Questions
              </Link>


              <Link
                to="/upload"
                className="secondary-btn"
              >
                Upload Material
              </Link>


              <Link
                to="/ai"
                className="ai-btn"
              >
                ✨ Ask UniQBank AI
              </Link>

            </div>

          </div>

        </div>

      </section>


      {/* ======================================================
          SEARCH
      ====================================================== */}

      <section className="search-section">

        <div className="container">

          <form
            className="search-box"
            onSubmit={searchQuestions}
          >

            <input
              type="text"
              placeholder="Search course code, course title..."
              value={keyword}
              onChange={(event) =>
                setKeyword(event.target.value)
              }
            />


            <div className="search-info">
              Search questions
            </div>


            <div className="search-info">
              Fast & simple
            </div>


            <button type="submit">
              Search
            </button>

          </form>

        </div>

      </section>


      {/* ======================================================
          CATEGORIES
      ====================================================== */}

      <section className="categories">

        <div className="container">

          <div className="section-heading">

            <span>
              EXPLORE
            </span>

            <h2>
              Academic resources
            </h2>

          </div>


          <div className="category-grid">

            {/* QUESTIONS */}

            <Link
              to="/questions"
              className="category-card"
            >

              <div className="category-icon">
                📄
              </div>

              <h3>
                Question Papers
              </h3>

              <p>
                Browse previous university exam
                question papers.
              </p>

            </Link>


            {/* NOTES */}

            <Link
              to="/notes"
              className="category-card"
            >

              <div className="category-icon">
                📝
              </div>

              <h3>
                Lecture Notes
              </h3>

              <p>
                Keep your important lecture notes
                organized.
              </p>

            </Link>


            {/* BOOKS */}

            <Link
              to="/books"
              className="category-card"
            >

              <div className="category-icon">
                📚
              </div>

              <h3>
                Books
              </h3>

              <p>
                Find useful academic books and
                study materials.
              </p>

            </Link>


            {/* SYLLABUS */}

            <Link
              to="/syllabus"
              className="category-card"
            >

              <div className="category-icon">
                📖
              </div>

              <h3>
                Syllabus
              </h3>

              <p>
                Access course and semester
                syllabus information.
              </p>

            </Link>


            {/* AI */}

            <Link
              to="/ai"
              className="category-card ai-category-card"
            >

              <div className="category-icon">
                ✨
              </div>

              <h3>
                UniQBank AI
              </h3>

              <p>
                Ask questions, get study help and
                use the UniQBank AI assistant.
              </p>

            </Link>

          </div>

        </div>

      </section>


      {/* ======================================================
          FEATURES
      ====================================================== */}

      <section className="features">

        <div className="container">

          <div className="feature-grid">

            {/* FEATURE 1 */}

            <div className="feature">

              <div className="feature-icon">
                🔎
              </div>

              <div>

                <h3>
                  Easy Search
                </h3>

                <p>
                  Quickly find questions using
                  course, department or semester.
                </p>

              </div>

            </div>


            {/* FEATURE 2 */}

            <div className="feature">

              <div className="feature-icon">
                ⚡
              </div>

              <div>

                <h3>
                  Fast Access
                </h3>

                <p>
                  Open and download academic
                  materials without unnecessary
                  steps.
                </p>

              </div>

            </div>


            {/* FEATURE 3 */}

            <div className="feature">

              <div className="feature-icon">
                🤖
              </div>

              <div>

                <h3>
                  AI Study Assistant
                </h3>

                <p>
                  Get help with academic questions
                  using UniQBank AI.
                </p>

              </div>

            </div>


            {/* FEATURE 4 */}

            <div className="feature">

              <div className="feature-icon">
                🌐
              </div>

              <div>

                <h3>
                  Open Platform
                </h3>

                <p>
                  No account is required to browse
                  available resources.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

    </>
  );
}


// ============================================================
// QUESTION CARD
// ============================================================

function QuestionCard({ question }) {
  const downloadUrl =
    `${API_URL}/api/questions/${question.id}/download`;

  const [downloadState, setDownloadState] = useState("idle");
  const [downloadedUrl, setDownloadedUrl] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const ensurePreviewUrl = async () => {
    if (downloadedUrl) {
      return downloadedUrl;
    }

    const response = await fetch(downloadUrl);

    if (!response.ok) {
      throw new Error("Preview failed.");
    }

    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);

    setDownloadedUrl(objectUrl);

    return objectUrl;
  };

  const handlePreview = async () => {
    try {
      setPreviewLoading(true);
      await ensurePreviewUrl();
      setShowPreview(true);
    } catch (error) {
      console.error(error);
      setDownloadState("error");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setDownloadState("downloading");
      setShowSuccess(false);

      const objectUrl = await ensurePreviewUrl();

      const link = document.createElement("a");
      link.href = objectUrl;
      link.download =
        question.original_name || "question-paper";
      document.body.appendChild(link);
      link.click();
      link.remove();

      setDownloadState("success");
      setShowSuccess(true);
    } catch (error) {
      console.error(error);
      setDownloadState("error");
    }
  };

  return (
    <article className="question-card">

      {/* TOP */}

      <div className="question-card-top">

        <div className="file-icon">
          📄
        </div>

        <div className="question-card-title">

          <h3>
            {question.course_title ||
              "Untitled Course"}
          </h3>

          <span>
            {question.course_code ||
              "No course code"}
          </span>

        </div>

      </div>


      {/* META */}

      <div className="question-meta">

        <div>
          <small>Department</small>
          <strong>{question.department || "—"}</strong>
        </div>

        <div>
          <small>Semester</small>
          <strong>{question.semester || "—"}</strong>
        </div>

        <div>
          <small>Exam</small>
          <strong>{question.exam_type || "—"}</strong>
        </div>

        <div>
          <small>Session</small>
          <strong>{question.session_year || "—"}</strong>
        </div>

      </div>


      {/* BOTTOM */}

      <div className="question-card-bottom">

        <span className="file-name">
          {question.original_name ||
            "Question paper"}
        </span>

        <div className="question-card-actions">

          <button
            type="button"
            className="preview-inline-btn"
            onClick={handlePreview}
            disabled={previewLoading}
          >
            {previewLoading ? "Loading..." : "👁 Preview"}
          </button>

          <button
            type="button"
            className="download-btn"
            onClick={handleDownload}
            disabled={downloadState === "downloading"}
          >
            {downloadState === "downloading"
              ? "Downloading..."
              : "↓ Download"}
          </button>

          <button
            type="button"
            className="report-btn"
            onClick={() => setShowReport(true)}
          >
            🚩 Report
          </button>

        </div>

      </div>

      {showReport && (
        <ReportModal
          questionId={question.id}
          onClose={() => setShowReport(false)}
        />
      )}


      {/* DOWNLOAD SUCCESS */}

      {showSuccess && (
        <div className="download-success">

          <div className="download-success-icon">
            ✓
          </div>

          <div className="download-success-content">

            <strong>
              Download Successful
            </strong>

            <p>
              Your question paper has been
              downloaded successfully.
            </p>

            <div className="download-success-actions">

              <button
                type="button"
                className="preview-btn"
                onClick={() => setShowPreview(true)}
              >
                👁 Preview
              </button>

              <button
                type="button"
                className="success-close-btn"
                onClick={() => setShowSuccess(false)}
              >
                Done
              </button>

            </div>

          </div>
        </div>
      )}


      {/* DOWNLOAD ERROR */}

      {downloadState === "error" && (
        <div className="download-error">
          ❌ Download failed. Please try again.
        </div>
      )}


      {/* PREVIEW MODAL */}

      {showPreview && downloadedUrl && (
        <div
          className="preview-overlay"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="preview-modal"
            onClick={(event) => event.stopPropagation()}
          >

            <div className="preview-header">

              <div>
                <strong>
                  Question Paper Preview
                </strong>

                <span>
                  {question.original_name ||
                    "Question paper"}
                </span>
              </div>

              <button
                type="button"
                className="preview-close"
                onClick={() => setShowPreview(false)}
                aria-label="Close preview"
              >
                ×
              </button>

            </div>

            <div className="preview-body">
              <iframe
                src={downloadedUrl}
                title="Question paper preview"
              />
            </div>

            <div className="preview-footer">

              <a
                href={downloadedUrl}
                download={
                  question.original_name ||
                  "question-paper"
                }
                className="download-btn"
              >
                ↓ Download Again
              </a>

              <button
                type="button"
                className="secondary-btn"
                onClick={() => setShowPreview(false)}
              >
                Close
              </button>

            </div>

          </div>
        </div>
      )}

    </article>
  );
}


// ============================================================
// QUESTIONS PAGE
// ============================================================

function Questions() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [questions, setQuestions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [examTypes, setExamTypes] = useState([]);
  const [sessionYears, setSessionYears] = useState([]);

  const [keyword, setKeyword] = useState(
    searchParams.get("keyword") || ""
  );

  const [department, setDepartment] = useState(
    searchParams.get("department") || ""
  );

  const [semester, setSemester] = useState(
    searchParams.get("semester") || ""
  );

  const [courseCode, setCourseCode] = useState(
    searchParams.get("courseCode") || ""
  );

  const [examType, setExamType] = useState(
    searchParams.get("examType") || ""
  );

  const [sessionYear, setSessionYear] = useState(
    searchParams.get("sessionYear") || ""
  );

  const [pagination, setPagination] = useState({
    page: Number(searchParams.get("page")) || 1,
    limit: 12,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      const page = Number(searchParams.get("page")) || 1;
      const limit = 12;

      if (keyword.trim()) {
        params.set("keyword", keyword.trim());
      }

      if (department) {
        params.set("department", department);
      }

      if (semester) {
        params.set("semester", semester);
      }

      if (courseCode.trim()) {
        params.set("courseCode", courseCode.trim());
      }

      if (examType) {
        params.set("examType", examType);
      }

      if (sessionYear) {
        params.set("sessionYear", sessionYear);
      }

      params.set("page", page);
      params.set("limit", limit);

      const result = await apiRequest(
        `${API_URL}/api/questions?${params.toString()}`
      );

      setQuestions(result?.data?.questions || []);

      const filters = result?.data?.filters || {};

      setDepartments(filters.departments || []);
      setSemesters(filters.semesters || []);
      setExamTypes(filters.examTypes || []);
      setSessionYears(filters.sessionYears || []);

      setPagination(
        result?.data?.pagination || {
          page,
          limit,
          total: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        }
      );
    } catch (err) {
      console.error(err);

      setError(
        err.message || "Unable to load question papers."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [searchParams.toString()]);

  const handleSearch = (event) => {
    event.preventDefault();

    const params = {};

    if (keyword.trim()) {
      params.keyword = keyword.trim();
    }

    if (department) {
      params.department = department;
    }

    if (semester) {
      params.semester = semester;
    }

    if (courseCode.trim()) {
      params.courseCode = courseCode.trim();
    }

    if (examType) {
      params.examType = examType;
    }

    if (sessionYear) {
      params.sessionYear = sessionYear;
    }

    params.page = "1";

    setSearchParams(params);
  };

  const clearFilters = () => {
    setKeyword("");
    setDepartment("");
    setSemester("");
    setCourseCode("");
    setExamType("");
    setSessionYear("");

    setSearchParams({});
  };

  const changePage = (page) => {
    if (
      page < 1 ||
      page > pagination.totalPages ||
      page === pagination.page
    ) {
      return;
    }

    const params = {};

    if (keyword.trim()) {
      params.keyword = keyword.trim();
    }

    if (department) {
      params.department = department;
    }

    if (semester) {
      params.semester = semester;
    }

    if (courseCode.trim()) {
      params.courseCode = courseCode.trim();
    }

    if (examType) {
      params.examType = examType;
    }

    if (sessionYear) {
      params.sessionYear = sessionYear;
    }

    params.page = String(page);

    setSearchParams(params);
  };

  const visiblePages = [];

  for (let page = 1; page <= pagination.totalPages; page++) {
    if (
      page === 1 ||
      page === pagination.totalPages ||
      Math.abs(page - pagination.page) <= 2
    ) {
      visiblePages.push(page);
    }
  }

  return (
    <section className="page-section">
      <div className="container">

        {/* HEADER */}

        <div className="page-header">
          <div>
            <span className="page-eyebrow">
              QUESTION BANK
            </span>

            <h1>
              Question Papers
            </h1>

            <p>
              Search and download previous
              university question papers.
            </p>
          </div>

          <Link
            to="/upload"
            className="primary-btn"
          >
            + Upload Question
          </Link>
        </div>


        {/* ADVANCED FILTER */}

        <form
          className="question-filter"
          onSubmit={handleSearch}
        >
          <input
            type="text"
            placeholder="Search by keyword, course title..."
            value={keyword}
            onChange={(event) =>
              setKeyword(event.target.value)
            }
          />

          <input
            type="text"
            placeholder="Course Code"
            value={courseCode}
            onChange={(event) =>
              setCourseCode(event.target.value)
            }
          />

          <select
            value={department}
            onChange={(event) =>
              setDepartment(event.target.value)
            }
          >
            <option value="">
              All Departments
            </option>

            {departments.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={semester}
            onChange={(event) =>
              setSemester(event.target.value)
            }
          >
            <option value="">
              All Semesters
            </option>

            {semesters.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={examType}
            onChange={(event) =>
              setExamType(event.target.value)
            }
          >
            <option value="">
              All Exam Types
            </option>

            {examTypes.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={sessionYear}
            onChange={(event) =>
              setSessionYear(event.target.value)
            }
          >
            <option value="">
              All Sessions
            </option>

            {sessionYears.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="filter-btn"
          >
            Search
          </button>

          <button
            type="button"
            className="clear-btn"
            onClick={clearFilters}
          >
            Clear
          </button>
        </form>


        {/* RESULT COUNT */}

        {!loading && !error && (
          <div className="result-bar">
            <span>
              {pagination.total}{" "}
              {pagination.total === 1
                ? "question"
                : "questions"}{" "}
              found
            </span>
          </div>
        )}


        {/* LOADING */}

        {loading && (
          <div className="state-box">
            <div className="loader"></div>

            <p>
              Loading question papers...
            </p>
          </div>
        )}


        {/* ERROR */}

        {!loading && error && (
          <div className="error-box">
            <strong>
              Unable to load questions
            </strong>

            <p>
              {error}
            </p>

            <button
              onClick={loadQuestions}
              className="primary-btn"
            >
              Try Again
            </button>
          </div>
        )}


        {/* EMPTY */}

        {!loading &&
          !error &&
          questions.length === 0 && (
            <div className="empty-box">
              <div className="empty-icon">
                📄
              </div>

              <h2>
                No question papers found
              </h2>

              <p>
                Try changing your search
                or filters.
              </p>

              <button
                className="secondary-btn"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            </div>
          )}


        {/* QUESTIONS */}

        {!loading &&
          !error &&
          questions.length > 0 && (
            <>
              <div className="questions-grid">
                {questions.map((question) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                  />
                ))}
              </div>


              {/* PAGINATION */}

              {pagination.totalPages > 1 && (
                <div className="question-pagination">

                  <button
                    type="button"
                    className="pagination-btn"
                    disabled={!pagination.hasPreviousPage}
                    onClick={() =>
                      changePage(pagination.page - 1)
                    }
                  >
                    ← Previous
                  </button>

                  {visiblePages.map((page, index) => {
                    const previousPage =
                      visiblePages[index - 1];

                    const showDots =
                      index > 0 &&
                      page - previousPage > 1;

                    return (
                      <React.Fragment key={page}>

                        {showDots && (
                          <span className="pagination-info">
                            ...
                          </span>
                        )}

                        <button
                          type="button"
                          className={`pagination-btn ${
                            page === pagination.page
                              ? "active"
                              : ""
                          }`}
                          onClick={() =>
                            changePage(page)
                          }
                        >
                          {page}
                        </button>

                      </React.Fragment>
                    );
                  })}

                  <button
                    type="button"
                    className="pagination-btn"
                    disabled={!pagination.hasNextPage}
                    onClick={() =>
                      changePage(pagination.page + 1)
                    }
                  >
                    Next →
                  </button>

                </div>
              )}

            </>
          )}

      </div>
    </section>
  );
}


// ============================================================
// UPLOAD QUESTION
// ============================================================
function UploadQuestion() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    department: "",
    semester: "",
    courseCode: "",
    courseTitle: "",
    examType: "",
    sessionYear: "",
    file: null,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [suggestions, setSuggestions] = useState({
    departments: [],
    sessionYears: [],
    courseCodes: [],
    courseTitles: [],
  });

  useEffect(() => {
    let isMounted = true;

    apiRequest(`${API_URL}/api/questions/meta`)
      .then((result) => {
        if (isMounted && result?.data) {
          setSuggestions({
            departments: result.data.departments || [],
            sessionYears: result.data.sessionYears || [],
            courseCodes: result.data.courseCodes || [],
            courseTitles: result.data.courseTitles || [],
          });
        }
      })
      .catch(() => {
        // Suggestions are a convenience only; ignore failures
        // so the upload form still works without them.
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value, files } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: files ? files[0] : value,
    }));

    if (name === "file") {
      setError("");
      setMessage("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    if (!form.file) {
      setError("Please select a PDF or image file.");
      setLoading(false);
      return;
    }

    const formData = new FormData();

    formData.append("department", form.department);
    formData.append("semester", form.semester);
    formData.append("courseCode", form.courseCode);
    formData.append("courseTitle", form.courseTitle);
    formData.append("examType", form.examType);
    formData.append("sessionYear", form.sessionYear);
    formData.append("file", form.file);

    try {
      await apiRequest(`${API_URL}/api/questions`, {
        method: "POST",
        body: formData,
      });

      setMessage(
        "Question paper uploaded successfully."
      );

      setForm({
        department: "",
        semester: "",
        courseCode: "",
        courseTitle: "",
        examType: "",
        sessionYear: "",
        file: null,
      });

      const fileInput =
        document.getElementById("question-file");

      if (fileInput) {
        fileInput.value = "";
      }
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Upload failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-section upload-page">
      <div className="container upload-container">

        {/* PAGE HEADER */}
        <div className="upload-page-header">

          <div>
            <span className="page-eyebrow">
              CONTRIBUTE
            </span>

            <h1>
              Upload Question Paper
            </h1>

            <p>
              Share a previous university question paper
              and help other students.
            </p>
          </div>

        </div>


        {/* FORM */}
        <form
          className="upload-form"
          onSubmit={handleSubmit}
        >

          {/* PAPER INFORMATION */}
          <div className="upload-section">

            <div className="upload-section-heading">
              <div className="upload-section-icon">
                📋
              </div>

              <div>
                <h2>
                  Paper Information
                </h2>

                <p>
                  Add the basic information about this question paper.
                </p>
              </div>
            </div>


            <div className="form-grid">

              {/* DEPARTMENT */}
              <div className="form-group">
                <label htmlFor="department">
                  Department
                  <span>*</span>
                </label>

                <input
                  id="department"
                  type="text"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  placeholder="e.g. CSE"
                  list="department-suggestions"
                  autoComplete="off"
                  required
                />

                <datalist id="department-suggestions">
                  {suggestions.departments.map((item) => (
                    <option key={item} value={item} />
                  ))}
                </datalist>
              </div>


              {/* SEMESTER */}
              <div className="form-group">
                <label htmlFor="semester">
                  Semester
                  <span>*</span>
                </label>

                <select
                  id="semester"
                  name="semester"
                  value={form.semester}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select semester
                  </option>

                  <option value="1st Semester">
                    1st Semester
                  </option>

                  <option value="2nd Semester">
                    2nd Semester
                  </option>

                  <option value="3rd Semester">
                    3rd Semester
                  </option>

                  <option value="4th Semester">
                    4th Semester
                  </option>

                  <option value="5th Semester">
                    5th Semester
                  </option>

                  <option value="6th Semester">
                    6th Semester
                  </option>

                  <option value="7th Semester">
                    7th Semester
                  </option>

                  <option value="8th Semester">
                    8th Semester
                  </option>
                </select>
              </div>


              {/* COURSE CODE */}
              <div className="form-group">
                <label htmlFor="courseCode">
                  Course Code
                  <span>*</span>
                </label>

                <input
                  id="courseCode"
                  type="text"
                  name="courseCode"
                  value={form.courseCode}
                  onChange={handleChange}
                  placeholder="e.g. CSE 2201"
                  list="course-code-suggestions"
                  autoComplete="off"
                  required
                />

                <datalist id="course-code-suggestions">
                  {suggestions.courseCodes.map((item) => (
                    <option key={item} value={item} />
                  ))}
                </datalist>
              </div>


              {/* COURSE TITLE */}
              <div className="form-group">
                <label htmlFor="courseTitle">
                  Course Title
                  <span>*</span>
                </label>

                <input
                  id="courseTitle"
                  type="text"
                  name="courseTitle"
                  value={form.courseTitle}
                  onChange={handleChange}
                  placeholder="e.g. Data Structures"
                  list="course-title-suggestions"
                  autoComplete="off"
                  required
                />

                <datalist id="course-title-suggestions">
                  {suggestions.courseTitles.map((item) => (
                    <option key={item} value={item} />
                  ))}
                </datalist>
              </div>


              {/* EXAM TYPE */}
              <div className="form-group">
                <label htmlFor="examType">
                  Exam Type
                  <span>*</span>
                </label>

                <select
                  id="examType"
                  name="examType"
                  value={form.examType}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select exam type
                  </option>

                  <option value="Mid-1">
                    Mid-1
                  </option>

                  <option value="Mid-2">
                    Mid-2
                  </option>

                  <option value="Quiz-1">
                    Quiz-1
                  </option>

                  <option value="Quiz-2">
                    Quiz-2
                  </option>

                  <option value="Final">
                    Final
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>
              </div>


              {/* SESSION */}
              <div className="form-group">
                <label htmlFor="sessionYear">
                  Session / Year
                  <span>*</span>
                </label>

                <input
                  id="sessionYear"
                  type="text"
                  name="sessionYear"
                  value={form.sessionYear}
                  onChange={handleChange}
                  placeholder="e.g. 2025-2026"
                  list="session-year-suggestions"
                  autoComplete="off"
                  required
                />

                <datalist id="session-year-suggestions">
                  {suggestions.sessionYears.map((item) => (
                    <option key={item} value={item} />
                  ))}
                </datalist>
              </div>

            </div>

          </div>


          {/* FILE UPLOAD */}
          <div className="upload-section file-section">

            <div className="upload-section-heading">
              <div className="upload-section-icon">
                📄
              </div>

              <div>
                <h2>
                  Question Paper
                </h2>

                <p>
                  Upload the question paper file.
                </p>
              </div>
            </div>


            <label
              htmlFor="question-file"
              className="file-upload-area"
            >

              <div className="file-upload-icon">
                ↑
              </div>

              <div className="file-upload-title">
                {form.file
                  ? form.file.name
                  : "Choose a question paper"}
              </div>

              <div className="file-upload-description">
                {form.file
                  ? `${(
                      form.file.size /
                      1024 /
                      1024
                    ).toFixed(2)} MB`
                  : "PDF, JPG, PNG or WEBP"}
              </div>

              <span className="choose-file-button">
                {form.file
                  ? "Choose Another File"
                  : "Choose File"}
              </span>

              <small>
                Maximum file size: 10MB
              </small>

            </label>

            <input
              id="question-file"
              className="hidden-file-input"
              type="file"
              name="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={handleChange}
              required={!form.file}
            />

          </div>


          {/* ERROR */}
          {error && (
            <div className="form-message form-error">
              <span>!</span>

              <div>
                <strong>
                  Upload failed
                </strong>

                <p>
                  {error}
                </p>
              </div>
            </div>
          )}


          {/* SUCCESS */}
          {message && (
            <div className="form-message form-success">
              <span>✓</span>

              <div>
                <strong>
                  Upload successful
                </strong>

                <p>
                  {message}
                </p>
              </div>
            </div>
          )}


          {/* ACTIONS */}
          <div className="upload-actions">

            <button
              type="submit"
              className="primary-btn upload-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="button-spinner"></span>
                  Uploading...
                </>
              ) : (
                <>
                  ↑ Upload Question Paper
                </>
              )}
            </button>


            <button
              type="button"
              className="secondary-btn"
              onClick={() => navigate("/questions")}
              disabled={loading}
            >
              View Questions
            </button>

          </div>

        </form>

      </div>
    </section>
  );
}


// ============================================================
// RESOURCE PAGE
// ============================================================

function ResourcePage({
  icon,
  title,
  description,
}) {
  return (
    <section className="page-section">

      <div className="container">

        <div className="resource-page">

          <div className="resource-icon">
            {icon}
          </div>


          <span className="page-eyebrow">
            COMING SOON
          </span>


          <h1>
            {title}
          </h1>


          <p>
            {description}
          </p>


          <div className="resource-actions">

            <Link
              to="/questions"
              className="primary-btn"
            >
              Browse Questions
            </Link>


            <Link
              to="/upload"
              className="secondary-btn"
            >
              Upload Question
            </Link>

          </div>

        </div>

      </div>

    </section>
  );
}


// ============================================================
// 404
// ============================================================

function NotFound() {
  return (
    <section className="page-section">

      <div className="container">

        <div className="resource-page">

          <div className="resource-icon">
            404
          </div>


          <h1>
            Page not found
          </h1>


          <p>
            The page you are looking for
            does not exist.
          </p>


          <Link
            to="/"
            className="primary-btn"
          >
            Go Home
          </Link>

        </div>

      </div>

    </section>
  );
}


// ============================================================
// APP
// ============================================================

export default function App() {

  return (
    <BrowserRouter>

      <Layout>

        <Routes>

          {/* HOME */}

          <Route
            path="/"
            element={
              <>
                <Seo
                  title="UniQBank — University Question Bank"
                  description="UniQBank is a university question-bank and academic resource platform for finding past exam papers, notes, books and syllabus materials."
                  path="/"
                />
                <Home />
              </>
            }
          />


          {/* QUESTIONS */}

          <Route
            path="/questions"
            element={
              <>
                <Seo
                  title="Browse University Question Papers | UniQBank"
                  description="Search and filter previous exam question papers by department, semester, course and exam type, then download them instantly."
                  path="/questions"
                />
                <Questions />
              </>
            }
          />


          {/* UPLOAD */}

          <Route
            path="/upload"
            element={
              <>
                <Seo
                  title="Upload a Question Paper | UniQBank"
                  description="Share a previous exam question paper with other students on UniQBank's university question bank."
                  path="/upload"
                />
                <UploadQuestion />
              </>
            }
          />


          {/* NOTES */}

          <Route
            path="/notes"
            element={
              <>
                <Seo
                  title="Lecture Notes | UniQBank"
                  description="Lecture notes will be available here soon on UniQBank."
                  path="/notes"
                  noindex
                />
                <ResourcePage
                  icon="📝"
                  title="Lecture Notes"
                  description="Lecture notes will be available here soon."
                />
              </>
            }
          />


          {/* BOOKS */}

          <Route
            path="/books"
            element={
              <>
                <Seo
                  title="Books | UniQBank"
                  description="Academic books and study materials will be available here soon on UniQBank."
                  path="/books"
                  noindex
                />
                <ResourcePage
                  icon="📚"
                  title="Books"
                  description="Academic books and study materials will be available here soon."
                />
              </>
            }
          />


          {/* SYLLABUS */}

          <Route
            path="/syllabus"
            element={
              <>
                <Seo
                  title="Syllabus | UniQBank"
                  description="University and course syllabus information will be available here soon on UniQBank."
                  path="/syllabus"
                  noindex
                />
                <ResourcePage
                  icon="📖"
                  title="Syllabus"
                  description="University and course syllabus information will be available here soon."
                />
              </>
            }
          />


          {/* AI */}

          <Route
            path="/ai"
            element={
              <>
                <Seo
                  title="AI Assignment Help | UniQBank"
                  description="Ask UniQBank's AI assistant questions about your coursework and get instant academic help."
                  path="/ai"
                />
                <AIChat />
              </>
            }
          />


          {/* ADMIN */}

          <Route
            path="/admin/login"
            element={
              <>
                <Seo
                  title="Admin Login | UniQBank"
                  path="/admin/login"
                  noindex
                />
                <AdminLogin />
              </>
            }
          />

          <Route
            path="/admin/moderation"
            element={
              <>
                <Seo
                  title="Admin Moderation | UniQBank"
                  path="/admin/moderation"
                  noindex
                />
                <AdminModeration />
              </>
            }
          />


          {/* 404 */}

          <Route
            path="*"
            element={
              <>
                <Seo
                  title="Page Not Found | UniQBank"
                  noindex
                />
                <NotFound />
              </>
            }
          />

        </Routes>

      </Layout>

    </BrowserRouter>
  );
}