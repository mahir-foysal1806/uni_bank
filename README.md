# UniQBank

> Open-source university question bank and academic resource platform.

UniQBank is an open-source web platform designed to make university
academic resources easier to upload, search, share, and download.

The initial focus of UniQBank is university question papers. The project is
designed to grow into a broader academic resource platform supporting
question papers, notes, books, syllabus materials, assignment tools, and
other student-focused features.

---

## ✨ Features

### Currently Available

- 📄 Upload university question papers
- 🔎 Search question papers
- 🏫 Filter by department
- 📚 Filter by semester
- 📝 Course code and course title
- 📅 Exam type and session year
- ⬇️ Download question papers
- 📊 Download counter
- ☁️ S3-compatible object storage
- 🗄️ PostgreSQL database
- ⚛️ React frontend
- 🚀 Express REST API
- 📱 Responsive interface
- 🔓 No-login architecture

### Planned Features

- 📝 Notes
- 📚 Books
- 📖 Syllabus
- 🤖 AI Assignment Assistant
- 🎨 Dynamic Assignment Cover Generator
- 🔍 Advanced search
- 🏷️ More filtering options
- ⭐ Resource rating/review system
- 📈 Better analytics
- 🛡️ Improved moderation and abuse protection

---

# 🏗️ Architecture

```text
                    ┌─────────────────────┐
                    │    React Frontend   │
                    │       (Vite)        │
                    └──────────┬──────────┘
                               │
                         HTTP / JSON
                               │
                               ▼
                    ┌─────────────────────┐
                    │    Express API      │
                    │      Node.js        │
                    └──────────┬──────────┘
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
                 ▼                           ▼
        ┌─────────────────┐        ┌─────────────────┐
        │   PostgreSQL    │        │ Object Storage  │
        │    Database     │        │ S3 Compatible   │
        └─────────────────┘        └─────────────────┘




📁 Project Structure

 UniQBank/
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── config/
│   └── db.js
│
├── controllers/
│   └── questionController.js
│
├── models/
│   └── questionModel.js
│
├── routes/
│   └── questionRoutes.js
│
├── services/
│   └── storageService.js
│
├── middleware/
│   └── upload.js
│
├── schema.sql
├── server.js
├── package.json
├── .env.example
├── .gitignore
├── CONTRIBUTING.md
├── LICENSE
└── README.md


# UniQBank — University Question Bank v2

An open, no-login web app for university academic resources: past question
papers, textbooks, lecture notes, and syllabus documents — all searchable
and downloadable instantly. Also includes an AI assignment-planning
assistant and a dynamic PDF cover-page generator. No accounts, no auth.

## Tech stack

- **Node.js + Express** — server & routing
- **EJS** — server-rendered views
- **PostgreSQL** (`pg`) — storage for all metadata
- **Multer** — multipart file uploads, stored on disk under `public/uploads/`
- **pdfkit** — generates the dynamic assignment cover PDF at runtime
- **Anthropic API** — powers the AI assignment assistant
- **Tailwind CSS (CDN)** — styling, no build step required
- **Helmet, express-rate-limit, morgan** — security headers, abuse control, logging

## Project structure

```
uniqbank/
├── config/
│   └── db.js                    # PostgreSQL connection pool
├── controllers/
│   ├── aiController.js          # AI assignment assistant
│   ├── bookController.js
│   ├── coverController.js       # Dynamic cover generator
│   ├── noteController.js
│   ├── questionController.js
│   └── syllabusController.js
├── middleware/
│   ├── errorMiddleware.js       # 404 + centralized error handler
│   └── uploadMiddleware.js      # Per-section multer configs
├── models/
│   ├── bookModel.js
│   ├── noteModel.js
│   ├── questionModel.js
│   └── syllabusModel.js
├── public/
│   ├── css/style.css
│   ├── js/main.js
│   └── uploads/{questions,books,notes,syllabus,covers}/
├── routes/
│   ├── aiRoutes.js
│   ├── bookRoutes.js
│   ├── coverRoutes.js
│   ├── noteRoutes.js
│   ├── questionRoutes.js
│   └── syllabusRoutes.js
├── services/
│   ├── aiService.js             # Anthropic API wrapper
│   ├── coverService.js          # pdfkit cover generation
│   └── fileService.js           # Streaming downloads, safe cleanup
├── utils/
│   ├── helpers.js
│   └── validators.js
├── views/
│   ├── ai/assignment.ejs
│   ├── books/{list,upload}.ejs
│   ├── covers/generate.ejs
│   ├── notes/{list,upload}.ejs
│   ├── partials/{header,nav,footer}.ejs
│   ├── questions/list.ejs
│   ├── syllabus/{list,upload}.ejs
│   ├── index.ejs
│   ├── error.ejs
│   └── upload.ejs               # legacy top-level question upload form
├── schema.sql
├── server.js
├── package.json
└── .env.example
```

## Installation

### Prerequisites

- **Node.js** >= 18.0.0 and npm
- **PostgreSQL** >= 13 (local install, or a hosted instance)
- (Optional) an **Anthropic API key** if you want the AI assignment
  assistant to work — get one at https://console.anthropic.com/

### Steps

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd uniqbank
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create a PostgreSQL database**

   ```bash
   createdb uniqbank
   ```

4. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Open `.env` and set at minimum:

   ```
   DATABASE_URL=postgres://user:password@localhost:5432/uniqbank
   PORT=3000
   INSTITUTION_NAME=Your University Name
   ANTHROPIC_API_KEY=sk-ant-...   # optional, enables /ai/assignment
   AI_RATE_LIMIT_PER_HOUR=20      # optional
   ```

5. **Run the database migration**

   ```bash
   npm run db:migrate
   # equivalent to: psql "$DATABASE_URL" -f schema.sql
   ```

6. **Start the app**

   ```bash
   npm start
   ```

   For development with auto-reload on file changes:

   ```bash
   npm run dev
   ```

7. **Open the app**

   Visit **http://localhost:3000** in your browser. The dashboard should
   show counts of 0 for each section until you upload something.

### Quick verify

```bash
curl -I http://localhost:3000
# Expect: HTTP/1.1 200 OK
```

If it fails, double-check `DATABASE_URL` and that PostgreSQL is running
and reachable.

## Feature map

| Section              | Browse/Search      | Upload             | Download                  |
|-----------------------|--------------------|--------------------|----------------------------|
| Question papers       | `GET /questions`   | `GET/POST /questions/upload` (also `/upload` for backward compat) | `GET /questions/download/:id` |
| Books & references    | `GET /books`       | `GET/POST /books/upload` | `GET /books/download/:id` |
| Notes                 | `GET /notes`       | `GET/POST /notes/upload` | `GET /notes/download/:id` |
| Syllabus              | `GET /syllabus`    | `GET/POST /syllabus/upload` | `GET /syllabus/download/:id` |
| AI assignment assistant | `GET /ai/assignment` | `POST /ai/assignment` (rate-limited) | — (renders result inline) |
| Dynamic cover generator | `GET /covers/generate` | `POST /covers/generate` | Streams a generated PDF directly |

### AI Assignment Assistant

Calls the Anthropic Messages API (`services/aiService.js`) to produce an
outline, example draft section, summary, or study guide for a topic the
student provides. It is deliberately scoped as a **planning aid**, not a
finished-essay generator — the system prompt steers toward structure and
guidance, and the UI displays an academic-integrity notice. Requests are
rate-limited per IP (`AI_RATE_LIMIT_PER_HOUR`, default 20/hour) since there
is no auth to gate usage, and a lightweight log (topic, type, and a hashed
IP — never the raw IP) is kept in the `ai_requests` table for auditing.

### Dynamic Cover Generator

Generates a polished, branded one-page PDF cover (`services/coverService.js`,
via `pdfkit`) from a small form: student name/ID, course, department,
semester, instructor, and submission date, with a choice of three visual
templates. The file streams straight back as a download and a record is
kept in the `covers` table.

## Deploying to Render or Railway

1. Push this project to a GitHub repository.
2. Create a new **Web Service** (Render) or **Project → Service from Repo** (Railway).
3. Build command: `npm install`. Start command: `npm start`.
4. Add a **PostgreSQL** add-on — it provides `DATABASE_URL` automatically.
5. Set `NODE_ENV=production` and `ANTHROPIC_API_KEY` in the environment variables.
6. Run `psql "$DATABASE_URL" -f schema.sql` once against the provisioned database.

### A note on uploaded files in production

Files are stored on local disk under `public/uploads/`. On Render/Railway,
disks are **ephemeral by default**. For long-term persistence, either:

- attach a **persistent disk/volume** pointed at `public/uploads/`, or
- swap in an object-store multer engine (S3, R2, B2) in each
  `middleware/uploadMiddleware.js` uploader.

The same applies to `public/uploads/covers/` — generated cover PDFs will
also be lost on redeploy unless persisted.

## Security notes

- File uploads are restricted by MIME type and size per section (see
  `middleware/uploadMiddleware.js` and `.env` for size caps).
- All SQL queries are parameterized (`$1, $2, ...`).
- Helmet sets standard security headers; a strict CSP only allows the
  Tailwind CDN and same-origin assets.
- The AI route is rate-limited per IP since there is no authentication.
- The app remains intentionally open otherwise — don't put anything in the
  uploads folders you wouldn't want publicly downloadable.

## Roadmap ideas

- Full-text search across notes/books content, not just metadata
- Tagging/favoriting without accounts (e.g. via signed link tokens)
- Admin moderation queue for flagged uploads
- Additional AI output types (flashcards, quiz generation from notes)