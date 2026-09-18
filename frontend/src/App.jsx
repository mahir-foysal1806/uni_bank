import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

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

        {/* Hero */}
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


        {/* Search */}
        <section className="search-section">

          <div className="container">

            <div className="search-box">

              <input
                type="text"
                placeholder="Search course code, course title..."
              />

              <select defaultValue="">
                <option value="">
                  All Departments
                </option>
                <option>CSE</option>
                <option>EEE</option>
                <option>ICE</option>
                <option>ME</option>
              </select>

              <select defaultValue="">
                <option value="">
                  All Semesters
                </option>
                <option>1st Semester</option>
                <option>2nd Semester</option>
                <option>3rd Semester</option>
                <option>4th Semester</option>
              </select>

              <button>
                Search
              </button>

            </div>

          </div>

        </section>


        {/* Categories */}
        <section className="categories">

          <div className="container">

            <div className="section-heading">

              <div>
                <span>EXPLORE</span>

                <h2>
                  Everything you need
                </h2>
              </div>

            </div>


            <div className="category-grid">

              <Link to="/questions" className="category-card">
                <div className="category-icon">📄</div>
                <h3>Question Papers</h3>
                <p>
                  Find previous university exam papers.
                </p>
              </Link>


              <Link to="/notes" className="category-card">
                <div className="category-icon">📝</div>
                <h3>Lecture Notes</h3>
                <p>
                  Access useful lecture notes and study materials.
                </p>
              </Link>


              <Link to="/books" className="category-card">
                <div className="category-icon">📚</div>
                <h3>Books</h3>
                <p>
                  Discover textbooks and academic resources.
                </p>
              </Link>


              <Link to="/syllabus" className="category-card">
                <div className="category-icon">📑</div>
                <h3>Syllabus</h3>
                <p>
                  Browse university course syllabuses.
                </p>
              </Link>

            </div>

          </div>

        </section>


        {/* Features */}
        <section className="features">

          <div className="container">

            <div className="feature-grid">

              <div className="feature">

                <div className="feature-icon">
                  🔎
                </div>

                <div>
                  <h3>Easy Search</h3>

                  <p>
                    Quickly find papers using course code,
                    department or semester.
                  </p>
                </div>

              </div>


              <div className="feature">

                <div className="feature-icon">
                  ⚡
                </div>

                <div>
                  <h3>Fast Access</h3>

                  <p>
                    Download your required study material
                    without unnecessary steps.
                  </p>
                </div>

              </div>


              <div className="feature">

                <div className="feature-icon">
                  🌐
                </div>

                <div>
                  <h3>Open Platform</h3>

                  <p>
                    Access academic resources without
                    creating an account.
                  </p>
                </div>

              </div>

            </div>

          </div>

        </section>

      </main>


      {/* Footer */}
      <footer>

        <div className="container footer-inner">

          <div>

            <Link to="/" className="logo">
              UniQBank
            </Link>

            <p>
              University resources, all in one place.
            </p>

          </div>

          <div className="footer-links">

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

          </div>

        </div>

        <div className="container copyright">
          © {new Date().getFullYear()} UniQBank. All rights reserved.
        </div>

      </footer>

    </>
  );
}


function Placeholder({ title }) {
  return (
    <>
      <Navbar />

      <main className="placeholder-page">

        <h1>{title}</h1>

        <p>
          This section is coming next.
        </p>

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
          element={<Placeholder title="Upload Question" />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;