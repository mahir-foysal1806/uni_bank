require("dotenv").config();

const createApp = require("./app");

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV === "production") {
  try {
    require("./config/env").getJwtSecret();
  } catch (error) {
    console.error("Startup warning:", error.message, "Admin login will be disabled.");
  }
}

const app = createApp();

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log("UniQBank server running on port " + PORT);
});

function shutdown() {
  server.close(async () => {
    try {
      await require("./config/db").end();
    } catch {
      /* ignore */
    }
    process.exit(0);
  });
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
