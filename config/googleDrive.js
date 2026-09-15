require("dotenv").config();

const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

let driveClient = null;

// Returns an authenticated Google Drive v3 client.
async function getDrive() {
  if (driveClient) {
    return driveClient;
  }

  // 1. Google Service Account credentials (from environment variables)
  if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/drive"],
    });

    driveClient = google.drive({ version: "v3", auth });
    return driveClient;
  }

  // 2. OAuth2 Refresh Token (from environment variables)
  if (
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REFRESH_TOKEN
  ) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || "http://127.0.0.1:3000/oauth2callback"
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    driveClient = google.drive({ version: "v3", auth: oauth2Client });
    return driveClient;
  }

  // 3. Local token.json / credentials.json fallback for development
  const TOKEN_PATH = path.join(__dirname, "../token.json");
  const CREDENTIALS_PATH = path.join(__dirname, "../credentials.json");

  if (fs.existsSync(TOKEN_PATH) && fs.existsSync(CREDENTIALS_PATH)) {
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));
    const { client_id, client_secret } =
      credentials.installed || credentials.web || {};

    const oauth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      "http://127.0.0.1:3000/oauth2callback"
    );

    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"));
    oauth2Client.setCredentials(token);

    driveClient = google.drive({ version: "v3", auth: oauth2Client });
    return driveClient;
  }

  throw new Error(
    "Google Drive credentials not configured. Please set GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY " +
    "(or GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN) in environment variables."
  );
}

module.exports = {
  getDrive,
};