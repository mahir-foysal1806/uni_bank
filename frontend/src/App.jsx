import { useEffect, useState } from "react";
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
      data?.message || `Request failed with status ${response.status}`
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
    { label: "Home", path: "/" },
    { label: "Questions", path: "/questions" },
    { label: "Notes", path: "/notes" },
    { label: "Books", path: "/books" },
    { label: "Syllabus", path: "/syllabus" },
  ];

  return (
    <header className="navbar">
      <div className="container nav-inner">

        <Link to="/" className="logo">
          UniQBank
        </Link>

        <nav className="nav-links">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `nav-link ${
                  isActive ||
                  (link.path === "/" && location.pathname === "/")
                    ? "active"
                    : ""
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <Link to="/upload" className="upload-btn">
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
          <Link to="/" className="logo">
            UniQBank
          </Link>

          <p>
            A simple university resource platform for students.
          </p>
        </div>

        <div className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/questions">Questions</Link>
          <Link to="/notes">Notes</Link>
          <Link to="/books">Books</Link>
          <Link to="/syllabus">Syllabus</Link>
          <Link to="/upload">Upload</Link>
        </div>

      </div>

      <div className="container copyright">
        © {new Date().getFullYear()} UniQBank. All rights reserved.
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
        `/questions?keyword=${encodeURIComponent(value)}`
      );
    } else {
      navigate("/questions");
    }
  };

  return (
    <>
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
              Find past question papers, lecture notes, books
              and syllabus materials in one simple place.
            </p>

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

            </div>

          </div>

        </div>
      </section>


      {/* SEARCH */}

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
              onChange={(e) => setKeyword(e.target.value)}
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


      {/* CATEGORIES */}

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
                Access course and semester syllabus
                information.
              </p>
            </Link>

          </div>

        </div>

      </section>


      {/* FEATURES */}

      <section className="features">

        <div className="container">

          <div className="feature-grid">

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
                  materials without unnecessary steps.
                </p>
              </div>

            </div>


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

  return (
    <article className="question-card">

      <div className="question-card-top">

        <div className="file-icon">
          📄
        </div>

        <div className="question-card-title">

          <h3>
            {question.course_title || "Untitled Course"}
          </h3>

          <span>
            {question.course_code || "No course code"}
          </span>

        </div>

      </div>


      <div className="question-meta">

        <div>
          <small>
            Department
          </small>

          <strong>
            {question.department || "—"}
          </strong>
        </div>


        <div>
          <small>
            Semester
          </small>

          <strong>
            {question.semester || "—"}
          </strong>
        </div>


        <div>
          <small>
            Exam
          </small>

          <strong>
            {question.exam_type || "—"}
          </strong>
        </div>


        <div>
          <small>
            Session
          </small>

          <strong>
            {question.session_year || "—"}
          </strong>
        </div>

      </div>


      <div className="question-card-bottom">

        <span className="file-name">
          {question.original_name || "Question paper"}
        </span>

        <a
          href={downloadUrl}
          className="download-btn"
          target="_blank"
          rel="noreferrer"
        >
          ↓ Download
        </a>

      </div>

    </article>
  );
}


// ============================================================
// QUESTIONS PAGE
// ============================================================

function Questions() {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const [questions, setQuestions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);

  const [keyword, setKeyword] = useState(
    searchParams.get("keyword") || ""
  );

  const [department, setDepartment] = useState(
    searchParams.get("department") || ""
  );

  const [semester, setSemester] = useState(
    searchParams.get("semester") || ""
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (keyword.trim()) {
        params.set("keyword", keyword.trim());
      }

      if (department) {
        params.set("department", department);
      }

      if (semester) {
        params.set("semester", semester);
      }

      const query = params.toString();

      const url =
        `${API_URL}/api/questions` +
        (query ? `?${query}` : "");

      const result = await apiRequest(url);

      setQuestions(result?.data?.questions || []);
      setDepartments(result?.data?.departments || []);
      setSemesters(result?.data?.semesters || []);

    } catch (err) {
      console.error(err);

      setError(
        err.message ||
        "Unable to load question papers."
      );

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadQuestions();
  }, [
    searchParams.toString(),
  ]);


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

    setSearchParams(params);
  };


  const clearFilters = () => {
    setKeyword("");
    setDepartment("");
    setSemester("");
    setSearchParams({});
  };


  return (
    <section className="page-section">

      <div className="container">

        <div className="page-header">

          <div>
            <span className="page-eyebrow">
              QUESTION BANK
            </span>

            <h1>
              Question Papers
            </h1>

            <p>
              Search and download previous university
              question papers.
            </p>
          </div>

          <Link
            to="/upload"
            className="primary-btn"
          >
            + Upload Question
          </Link>

        </div>


        {/* FILTER */}

        <form
          className="question-filter"
          onSubmit={handleSearch}
        >

          <input
            type="text"
            placeholder="Course code, title, department..."
            value={keyword}
            onChange={(e) =>
              setKeyword(e.target.value)
            }
          />


          <select
            value={department}
            onChange={(e) =>
              setDepartment(e.target.value)
            }
          >
            <option value="">
              All Departments
            </option>

            {departments.map((item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            ))}
          </select>


          <select
            value={semester}
            onChange={(e) =>
              setSemester(e.target.value)
            }
          >
            <option value="">
              All Semesters
            </option>

            {semesters.map((item) => (
              <option
                key={item}
                value={item}
              >
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
              {questions.length}{" "}
              {questions.length === 1
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
                Try changing your search or filters.
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

            <div className="questions-grid">

              {questions.map((question) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                />
              ))}

            </div>
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


  const handleChange = (event) => {
    const {
      name,
      value,
      files,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: files ? files[0] : value,
    }));
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

    formData.append(
      "department",
      form.department
    );

    formData.append(
      "semester",
      form.semester
    );

    formData.append(
      "courseCode",
      form.courseCode
    );

    formData.append(
      "courseTitle",
      form.courseTitle
    );

    formData.append(
      "examType",
      form.examType
    );

    formData.append(
      "sessionYear",
      form.sessionYear
    );

    formData.append(
      "file",
      form.file
    );


    try {
      await apiRequest(
        `${API_URL}/api/questions`,
        {
          method: "POST",
          body: formData,
        }
      );


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
    <section className="page-section">

      <div className="container upload-container">

        <div className="page-header">

          <div>
            <span className="page-eyebrow">
              CONTRIBUTE
            </span>

            <h1>
              Upload Question Paper
            </h1>

            <p>
              Help other students by sharing a
              university question paper.
            </p>
          </div>

        </div>


        <form
          className="upload-form"
          onSubmit={handleSubmit}
        >

          <div className="form-grid">


            <div className="form-group">

              <label>
                Department
              </label>

              <input
                name="department"
                value={form.department}
                onChange={handleChange}
                placeholder="e.g. CSE"
                required
              />

            </div>


            <div className="form-group">

              <label>
                Semester
              </label>

              <input
                name="semester"
                value={form.semester}
                onChange={handleChange}
                placeholder="e.g. 3rd Semester"
                required
              />

            </div>


            <div className="form-group">

              <label>
                Course Code
              </label>

              <input
                name="courseCode"
                value={form.courseCode}
                onChange={handleChange}
                placeholder="e.g. CSE 2201"
                required
              />

            </div>


            <div className="form-group">

              <label>
                Course Title
              </label>

              <input
                name="courseTitle"
                value={form.courseTitle}
                onChange={handleChange}
                placeholder="e.g. Data Structures"
                required
              />

            </div>


            <div className="form-group">

              <label>
                Exam Type
              </label>

              <select
                name="examType"
                value={form.examType}
                onChange={handleChange}
                required
              >
                <option value="">
                  Select exam type
                </option>

                <option value="Midterm">
                  Midterm
                </option>

                <option value="Final">
                  Final
                </option>

                <option value="Quiz">
                  Quiz
                </option>

                <option value="Other">
                  Other
                </option>
              </select>

            </div>


            <div className="form-group">

              <label>
                Session / Year
              </label>

              <input
                name="sessionYear"
                value={form.sessionYear}
                onChange={handleChange}
                placeholder="e.g. 2025"
                required
              />

            </div>


            <div className="form-group full-width">

              <label>
                Question Paper
              </label>

              <div className="file-input-wrapper">

                <input
                  id="question-file"
                  type="file"
                  name="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={handleChange}
                  required
                />

              </div>

              <small>
                PDF, JPG, PNG or WEBP. Maximum 10MB.
              </small>

            </div>

          </div>


          {error && (
            <div className="form-error">
              {error}
            </div>
          )}


          {message && (
            <div className="form-success">
              {message}
            </div>
          )}


          <div className="form-actions">

            <button
              type="submit"
              className="primary-btn"
              disabled={loading}
            >
              {loading
                ? "Uploading..."
                : "Upload Question"}
            </button>


            <button
              type="button"
              className="secondary-btn"
              onClick={() => navigate("/questions")}
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
// RESOURCE PLACEHOLDER
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
            The page you are looking for does not exist.
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

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/questions"
            element={<Questions />}
          />

          <Route
            path="/upload"
            element={<UploadQuestion />}
          />

          <Route
            path="/notes"
            element={
              <ResourcePage
                icon="📝"
                title="Lecture Notes"
                description="Lecture notes will be available here soon."
              />
            }
          />

          <Route
            path="/books"
            element={
              <ResourcePage
                icon="📚"
                title="Books"
                description="Academic books and study materials will be available here soon."
              />
            }
          />

          <Route
            path="/syllabus"
            element={
              <ResourcePage
                icon="📖"
                title="Syllabus"
                description="University and course syllabus information will be available here soon."
              />
            }
          />

          <Route
            path="*"
            element={<NotFound />}
          />

        </Routes>

      </Layout>

    </BrowserRouter>
  );
}