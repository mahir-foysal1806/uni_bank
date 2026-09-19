import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

function Navbar() {
  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="logo">
          UniQBank
        </Link>

        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/questions">Questions</Link>
          <Link to="/notes">Notes</Link>
          <Link to="/books">Books</Link>
          <Link to="/syllabus">Syllabus</Link>
        </nav>

        <Link to="/upload" className="upload-btn">
          + Upload
        </Link>
      </div>
    </header>
  );
}

function Home() {
  return (
    <>
      <Navbar />

      <main>
        <section className="hero">
          <div className="container hero-content">
            <div className="hero-text">
              <span className="hero-badge">
                UNIVERSITY QUESTION BANK
              </span>

              <h1>
                Find your university
                <span> question papers.</span>
              </h1>

              <p>
                Search, discover and download university question papers,
                notes, books and syllabus from one place.
              </p>

              <div className="hero-actions">
                <Link to="/questions" className="primary-btn">
                  Browse Questions
                </Link>

                <Link to="/upload" className="secondary-btn">
                  Upload Paper
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="categories">
          <div className="container">
            <div className="section-heading">
              <div>
                <span>EXPLORE</span>
                <h2>Everything you need</h2>
              </div>
            </div>

            <div className="category-grid">
              <Link to="/questions" className="category-card">
                <div className="category-icon">📄</div>
                <h3>Question Papers</h3>
                <p>Find previous university exam papers.</p>
              </Link>

              <Link to="/notes" className="category-card">
                <div className="category-icon">📝</div>
                <h3>Lecture Notes</h3>
                <p>Access useful lecture notes and study materials.</p>
              </Link>

              <Link to="/books" className="category-card">
                <div className="category-icon">📚</div>
                <h3>Books</h3>
                <p>Discover textbooks and academic resources.</p>
              </Link>

              <Link to="/syllabus" className="category-card">
                <div className="category-icon">📑</div>
                <h3>Syllabus</h3>
                <p>Browse university course syllabuses.</p>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="container footer-inner">
          <div>
            <Link to="/" className="logo">
              UniQBank
            </Link>

            <p>University resources, all in one place.</p>
          </div>
        </div>

        <div className="container copyright">
          © {new Date().getFullYear()} UniQBank. All rights reserved.
        </div>
      </footer>
    </>
  );
}

function UploadQuestion() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    department: "",
    semester: "",
    courseCode: "",
    courseTitle: "",
    examType: "",
    sessionYear: "",
  });

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleFileChange(event) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setFile(null);
      setError("Only PDF, JPG, PNG and WEBP files are allowed.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setFile(null);
      setError("Maximum file size is 10 MB.");
      return;
    }

    setError("");
    setFile(selectedFile);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!file) {
      setError("Please select a PDF or image file.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("department", form.department);
      formData.append("semester", form.semester);
      formData.append("courseCode", form.courseCode);
      formData.append("courseTitle", form.courseTitle);
      formData.append("examType", form.examType);
      formData.append("sessionYear", form.sessionYear);
      formData.append("file", file);

      const response = await fetch(`${API_URL}/api/questions`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Upload failed. Please try again."
        );
      }

      setMessage("Question paper uploaded successfully!");

      setForm({
        department: "",
        semester: "",
        courseCode: "",
        courseTitle: "",
        examType: "",
        sessionYear: "",
      });

      setFile(null);

      const fileInput = document.getElementById("question-file");

      if (fileInput) {
        fileInput.value = "";
      }
    } catch (uploadError) {
      console.error("Upload error:", uploadError);

      setError(
        uploadError.message ||
          "Could not connect to the server."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />

      <main className="placeholder-page">
        <div style={{ width: "100%", maxWidth: "760px" }}>
          <h1>Upload Question Paper</h1>

          <p>
            Upload a university question paper for other students.
          </p>

          <form
            onSubmit={handleSubmit}
            style={{
              marginTop: "32px",
              display: "grid",
              gap: "18px",
              textAlign: "left",
            }}
          >
            <label>
              Department
              <input
                type="text"
                name="department"
                value={form.department}
                onChange={handleChange}
                placeholder="e.g. CSE"
                required
              />
            </label>

            <label>
              Semester
              <input
                type="text"
                name="semester"
                value={form.semester}
                onChange={handleChange}
                placeholder="e.g. 3rd Semester"
                required
              />
            </label>

            <label>
              Course Code
              <input
                type="text"
                name="courseCode"
                value={form.courseCode}
                onChange={handleChange}
                placeholder="e.g. CSE 2201"
                required
              />
            </label>

            <label>
              Course Title
              <input
                type="text"
                name="courseTitle"
                value={form.courseTitle}
                onChange={handleChange}
                placeholder="e.g. Data Structures"
                required
              />
            </label>

            <label>
              Exam Type
              <select
                name="examType"
                value={form.examType}
                onChange={handleChange}
                required
              >
                <option value="">Select exam type</option>
                <option value="Midterm">Midterm</option>
                <option value="Final">Final</option>
                <option value="Quiz">Quiz</option>
                <option value="Assignment">Assignment</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <label>
              Session / Year
              <input
                type="text"
                name="sessionYear"
                value={form.sessionYear}
                onChange={handleChange}
                placeholder="e.g. 2025-2026"
                required
              />
            </label>

            <label>
              Question Paper
              <input
                id="question-file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={handleFileChange}
                required
              />
            </label>

            {file && (
              <p>
                Selected file: <strong>{file.name}</strong>
              </p>
            )}

            {error && (
              <p style={{ color: "red" }}>
                {error}
              </p>
            )}

            {message && (
              <p style={{ color: "green" }}>
                {message}
              </p>
            )}

            <button
              type="submit"
              className="primary-btn"
              disabled={loading}
            >
              {loading ? "Uploading..." : "Upload Question Paper"}
            </button>
          </form>

          <div style={{ marginTop: "24px" }}>
            <button
              type="button"
              className="secondary-btn"
              onClick={() => navigate("/")}
            >
              ← Back Home
            </button>
          </div>
        </div>
      </main>
    </>
  );
}

function Placeholder({ title }) {
  return (
    <>
      <Navbar />

      <main className="placeholder-page">
        <h1>{title}</h1>

        <p>This section is coming next.</p>

        <Link to="/" className="primary-btn">
          ← Back Home
        </Link>
      </main>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/questions"
          element={<Placeholder title="Question Papers" />}
        />

        <Route
          path="/notes"
          element={<Placeholder title="Lecture Notes" />}
        />

        <Route
          path="/books"
          element={<Placeholder title="Books" />}
        />

        <Route
          path="/syllabus"
          element={<Placeholder title="Syllabus" />}
        />

        <Route
          path="/upload"
          element={<UploadQuestion />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;