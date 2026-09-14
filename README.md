# UniQBank — University Question Bank

An open, no-login web app for uploading and downloading university past
question papers. Anyone can upload a PDF/image instantly, and anyone can
search, filter, and download instantly. No accounts, no auth.

## Tech stack

- **Node.js + Express** — server & routing
- **EJS** — server-rendered views
- **PostgreSQL** (`pg`) — storage for question metadata
- **Multer** — multipart file uploads, stored on disk under `public/uploads/`
- **Tailwind CSS (CDN)** — styling, no build step required

## Project structure

```
uniqbank/
├── config/
│   └── db.js                  # PostgreSQL connection pool
├── controllers/
│   └── questionController.js  # Upload, search, download logic
├── models/
│   └── questionModel.js       # SQL queries
├── routes/
│   └── questionRoutes.js      # Route definitions
├── views/
│   ├── index.ejs               # Home / browse / search page
│   └── upload.ejs              # Upload form
├── public/
│   └── uploads/                 # Uploaded files land here
├── schema.sql                  # DB schema + indexes
├── server.js                   # App entry point
├── package.json
└── .env.example
```

## Local setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create a PostgreSQL database** (locally, or via a free Render/Railway/Neon instance):

   ```bash
   createdb uniqbank
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set `DATABASE_URL`, e.g.:

   ```
   DATABASE_URL=postgresql://postgres:password@localhost:5432/uniqbank
   PORT=3000
   NODE_ENV=development
   ```

4. **Run the schema** to create the `questions` table and indexes:

   ```bash
   psql "$DATABASE_URL" -f schema.sql
   ```

5. **Start the app**

   ```bash
   npm start
   # or, with auto-reload during development:
   npm run dev
   ```

6. Visit **http://localhost:3000** — browse, search, upload, and download.

## How it works

- **Home (`GET /`)** — lists all question papers, newest first. Supports
  `?department=`, `?semester=`, and `?keyword=` query params for filtering
  (keyword matches course code or title, case-insensitive).
- **Upload form (`GET /upload`)** — a plain HTML form (department, semester,
  course code, course title, exam type, session year, file).
- **Upload submit (`POST /upload`)** — Multer validates the file (PDF/JPG/PNG/
  WEBP/GIF, ≤15MB), saves it to `public/uploads/` with a collision-safe
  filename, and inserts a row into `questions`.
- **Download (`GET /download/:id`)** — streams the file back with its original
  filename and increments `download_count`.

There is intentionally **no authentication** anywhere in the app — every
route is publicly accessible, matching the "open question bank" brief.

## Deploying to Render or Railway

Both platforms work the same way for this app:

1. Push this project to a GitHub repository.
2. Create a new **Web Service** (Render) or **Project → Service from Repo** (Railway).
3. Set the **build command** to `npm install` and the **start command** to `npm start`.
4. Add a **PostgreSQL database** add-on/plugin on the same platform — it will
   provide a `DATABASE_URL` environment variable automatically.
5. Set `NODE_ENV=production` in the service's environment variables.
6. After the first deploy, run `schema.sql` against the provisioned database
   once (e.g. via the platform's `psql` shell, or a one-off job):

   ```bash
   psql "$DATABASE_URL" -f schema.sql
   ```

7. Done — your UniQBank instance is live.

### A note on uploaded files in production

This app stores uploaded files on the local disk (`public/uploads/`). On
Render/Railway, disks are **ephemeral by default** — files can be lost on
redeploy or restart. For a production deployment where papers must persist
long-term, either:

- attach a **persistent disk/volume** to the service (both Render and Railway
  support this), pointed at `public/uploads/`, or
- swap the storage layer for an object store (e.g. S3, Cloudflare R2,
  Backblaze B2) by replacing the `multer.diskStorage` configuration in
  `controllers/questionController.js` with a suitable multer storage engine.

## Security notes

- All file uploads are restricted by MIME type (`application/pdf`,
  `image/jpeg`, `image/png`, `image/webp`, `image/gif`) and capped at 15MB.
- All SQL queries are parameterized (`$1, $2, ...`) to prevent SQL injection.
- Because the app has no authentication, treat it as intentionally public —
  don't put anything in the uploads folder you wouldn't want publicly
  downloadable.


## my intregration in future 
-add note section 
-book section 
-syllbus section
-assignement writing spacial ai api add kora
-assignement dainamnic cover 
-
