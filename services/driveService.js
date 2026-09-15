const { getDrive } = require("../config/googleDrive");
const fs = require("fs");

// Uploads a local file stream to Google Drive and returns metadata 
async function uploadFile(filePath, fileName, mimeType) {
  try {
    const drive = await getDrive();

    const fileMetadata = {
      name: fileName,
    };

    // Attach to folder if folder ID is provided
    if (process.env.GOOGLE_DRIVE_FOLDER_ID) {
      fileMetadata.parents = [process.env.GOOGLE_DRIVE_FOLDER_ID];
    }

    const media = {
      mimeType: mimeType,
      body: fs.createReadStream(filePath),
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id, name, webViewLink",
    });

    console.log("File uploaded to Google Drive:", response.data);

    return response.data;
  } catch (error) {
    console.error("Google Drive upload error:", error);
    throw error;
  }
}

// Streams a file directly from Google Drive to the HTTP response
async function downloadFile(fileId, res) {
  try {
    const drive = await getDrive();

    const response = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "stream" }
    );

    return new Promise((resolve, reject) => {
      response.data
        .on("error", (err) => {
          if (!res.headersSent) {
            res.status(500).send("Error downloading file from Google Drive.");
          }
          reject(err);
        })
        .pipe(res)
        .on("finish", () => resolve())
        .on("error", (err) => reject(err));
    });
  } catch (error) {
    console.error("Google Drive download error:", error);
    throw error;
  }
}

module.exports = {
  uploadFile,
  downloadFile,
};