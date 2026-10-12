# UniQBank — University Question Bank

React (Vite) frontend + Node/Express API + PostgreSQL + S3-compatible storage (ElasticLake) + optional Gemini AI assistant.

## Project layout
- `app.js` – Express app factory (used by `server.js` and tests); `server.js` – process entry
- `routes/ controllers/ models/ middleware/ services/ config/` – backend
- `migrations/` – idempotent SQL; `scripts/migrate.js` – explicit migration runner
- `tests/` – backend API tests (`node:test`, in-memory fake DB, no external services)
- `frontend/` – React app (routes lazy-loaded); `frontend/public/` holds `robots.txt`, `sitemap.xml`, the Google verification file and `_redirects`

## Local setup
```bash
cp .env.example .env            # fill in values (placeholders only in the example)
cp frontend/.env.example frontend/.env
npm install                     # NOTE: run once to refresh package-lock.json (see Known limitations)
npm --prefix frontend install
npm run migrate                 # safe, idempotent; see "Migrations"
npm run dev                     # API on :3000
npm --prefix frontend run dev   # UI on :5173
```

## Tests and checks
```bash
npm test                        # backend API tests
npm run check                   # syntax check
npm --prefix frontend run lint
npm --prefix frontend run build
```

## Migrations (safe order for production)
1. **Back up the database first** (`pg_dump "$DATABASE_URL" -Fc -f backup.dump`). Keep the dump out of Git.
2. Deploy the new backend code (it works with the old schema only until step 3 — hidden-question filtering needs `is_hidden`, so do 3 immediately).
3. Run `npm run migrate` once against production (Render shell, or locally with the production `DATABASE_URL`). It only `CREATE ... IF NOT EXISTS` / `ADD COLUMN IF NOT EXISTS`; it never drops, truncates or rewrites rows. Existing papers (including any whose files are missing in storage) are kept as is.
Migrations never run automatically at startup.

## Environment variables
See `.env.example`. Required for admin: `ADMIN_PASSWORD`, `ADMIN_JWT_SECRET` (>= 32 chars; there is **no fallback** — admin login/endpoints refuse to work without it). `FRONTEND_URL` / `CORS_ORIGINS` control CORS. `GEMINI_API_KEY` is optional: without it `/api/ai/chat` returns 503 and the UI shows an error (no fake replies).

## Render deployment
- **Backend (Web Service)**: build `npm install`, start `npm start`, health check path `/api/health` (readiness incl. DB: `/api/ready`). Set all variables from `.env.example`, `NODE_ENV=production`, `FRONTEND_URL=https://uni-bank-1.onrender.com`.
- **Frontend (Static Site)**: build `cd frontend && npm install && npm run build`, publish dir `frontend/dist`, env `VITE_API_URL=https://uni-bank.onrender.com`. `public/_redirects` provides SPA fallback so refresh/direct URLs work.
- Free-tier services sleep when idle; the first request after sleeping is slow (cold start). Code changes cannot remove that. This repo adds no keep-alive hack.

## Security notes
- Admin auth: password -> 12h HS256 JWT; all `/api/reports*` and `PATCH /api/questions/:id/hide` verify it server-side. The token is kept in `sessionStorage` (cleared when the tab closes), not `localStorage`. An httpOnly-cookie session would be stronger but needs a backend change not made here.
- Uploads: extension + MIME allow-list (pdf/jpg/png/webp), magic-byte check, 10 MB limit, random temp filenames, stored name derived from sanitized course code.
- All SQL is parameterized; ids are validated; errors return generic messages; rate limits on API, login, reports and AI.
- Moderation: hiding a paper is a soft flag (`is_hidden`); hidden papers disappear from search, detail and download.

## SEO
`robots.txt` disallows `/admin/` and `/api/`; admin pages also set `noindex`. The sitemap lists only `/`, `/questions`, `/upload`. There are no per-paper public pages, so none are listed. The app is client-rendered; no SSR/prerender is included, so indexing of dynamic content is limited. No ranking or indexing speed is promised.

## Known limitations
See the final report: lockfile refresh, tests/build not executed in the packaging environment, features not present in the repo (student accounts, textbook/notes resources, PDF cover generation), and unaddressed UI items.
