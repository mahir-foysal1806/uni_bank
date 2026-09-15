const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");
const http = require("http");
const { exec } = require("child_process");
const url = require("url");

const SCOPES = [
  "https://www.googleapis.com/auth/drive.file",
];

const TOKEN_PATH = path.join(__dirname, "../token.json");
const CREDENTIALS_PATH = path.join(__dirname, "../credentials.json");

const REDIRECT_URI = "http://127.0.0.1:3000/oauth2callback";

async function authorize() {
  const credentials = JSON.parse(
    fs.readFileSync(CREDENTIALS_PATH, "utf8")
  );

  const { client_id, client_secret } =
    credentials.installed || credentials.web;

  const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    REDIRECT_URI
  );

  // যদি token আগে থেকেই থাকে
  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(
      fs.readFileSync(TOKEN_PATH, "utf8")
    );

    oauth2Client.setCredentials(token);

    return oauth2Client;
  }

  // Google authorization URL
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });

  console.log("\n========================================");
  console.log("Google Drive Authorization Required");
  console.log("========================================\n");

  console.log("Open this URL in your browser:\n");
  console.log(authUrl);
  console.log("\n========================================\n");

  // Firefox automatically open করার চেষ্টা
  exec(`firefox "${authUrl}"`);

  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      try {
        const parsed = url.parse(req.url, true);

        if (parsed.pathname !== "/oauth2callback") {
          res.writeHead(404);
          res.end("Not Found");
          return;
        }

        const code = parsed.query.code;

        if (!code) {
          res.writeHead(400);
          res.end("Authorization code missing.");

          server.close();

          reject(
            new Error("Authorization code was not received.")
          );

          return;
        }

        const { tokens } =
          await oauth2Client.getToken(code);

        oauth2Client.setCredentials(tokens);

        fs.writeFileSync(
          TOKEN_PATH,
          JSON.stringify(tokens, null, 2)
        );

        res.writeHead(200, {
          "Content-Type": "text/html",
        });

        res.end(`
          <!DOCTYPE html>
          <html>
            <body>
              <h2>Google Drive authorization successful!</h2>
              <p>You can close this tab.</p>
            </body>
          </html>
        `);

        server.close();

        console.log("\n✅ OAuth token saved successfully.");

        resolve(oauth2Client);
      } catch (error) {
        server.close();
        reject(error);
      }
    });

    server.listen(3000, "127.0.0.1", () => {
      console.log(
        "OAuth callback server started."
      );
      console.log(
        "Waiting for Google authorization...\n"
      );
    });

    server.on("error", (error) => {
      reject(error);
    });
  });
}

async function getDrive() {
  const auth = await authorize();

  return google.drive({
    version: "v3",
    auth,
  });
}

module.exports = {
  getDrive,
};