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