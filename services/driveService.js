const { getDrive } = require("../config/googleDriveOAuth");
const fs = require("fs");

async function uploadFile(filePath, fileName, mimeType) {
  try {
    const drive = await getDrive();

    const fileMetadata = {
      name: fileName,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
    };

    const media = {
      mimeType: mimeType,
      body: fs.createReadStream(filePath),
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id, name, webViewLink",
    });

    console.log("File uploaded to Google Drive:");
    console.log(response.data);

    return response.data;
  } catch (error) {
    console.error("Google Drive upload error:", error);
    throw error;
  }
}

module.exports = {
  uploadFile,
};