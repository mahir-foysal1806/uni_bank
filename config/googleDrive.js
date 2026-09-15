require("dotenv").config();

const { google } = require("googleapis");

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/drive"],
});

const drive = google.drive({
  version: "v3",
  auth,
});

console.log("Google Drive client:", typeof drive);
console.log("Google Drive files:", typeof drive.files);
console.log("Google Drive create:", typeof drive.files?.create);

module.exports = drive;