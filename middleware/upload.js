const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const uploadDir = path.join(process.cwd(), "tmp", "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** extension -> allowed MIME types */
const ALLOWED = {
  ".pdf": ["application/pdf"],
  ".jpg": ["image/jpeg"],
  ".jpeg": ["image/jpeg"],
  ".png": ["image/png"],
  ".webp": ["image/webp"],
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ALLOWED[ext] ? ext : ""}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || "").toLowerCase();
  if (ALLOWED[ext] && ALLOWED[ext].includes(file.mimetype)) {
    return cb(null, true);
  }
  const err = new Error("Only PDF, JPG, PNG and WEBP files are allowed.");
  err.status = 400;
  cb(err, false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
});

/** Magic-byte signature check (extension/MIME can be spoofed). */
function matchesSignature(buf, ext) {
  if (ext === ".pdf") return buf.slice(0, 5).toString("latin1") === "%PDF-";
  if (ext === ".png") return buf.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (ext === ".jpg" || ext === ".jpeg") return buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  if (ext === ".webp") return buf.slice(0, 4).toString("latin1") === "RIFF" && buf.slice(8, 12).toString("latin1") === "WEBP";
  return false;
}

async function verifyUploadSignature(req, res, next) {
  if (!req.file) return next();
  let handle;
  try {
    handle = await fs.promises.open(req.file.path, "r");
    const buf = Buffer.alloc(16);
    await handle.read(buf, 0, 16, 0);
    await handle.close();
    handle = null;
    const ext = path.extname(req.file.originalname).toLowerCase();
    if (!matchesSignature(buf, ext)) {
      await fs.promises.unlink(req.file.path).catch(() => {});
      return res.status(400).json({
        success: false,
        message: "File content does not match its type.",
      });
    }
    next();
  } catch (error) {
    if (handle) await handle.close().catch(() => {});
    next(error);
  }
}

/** Wrap upload.single so multer errors become clean 400/413 responses. */
function singleUpload(field) {
  const mw = upload.single(field);
  return (req, res, next) =>
    mw(req, res, (err) => {
      if (!err) return next();
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({ success: false, message: "File is too large (max 10 MB)." });
      }
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ success: false, message: "Invalid upload." });
      }
      return res.status(err.status || 400).json({
        success: false,
        message: err.status ? err.message : "Invalid upload.",
      });
    });
}

module.exports = { upload, singleUpload, verifyUploadSignature, matchesSignature, ALLOWED, MAX_FILE_SIZE };
