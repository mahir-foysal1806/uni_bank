const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
} = require("@aws-sdk/client-s3");

const fs = require("fs");

const endpoint = process.env.ELASTICLAKE_ENDPOINT;
const accessKeyId = process.env.ELASTICLAKE_ACCESS_KEY;
const secretAccessKey = process.env.ELASTICLAKE_SECRET_KEY;
const bucket = process.env.ELASTICLAKE_BUCKET;

const s3 = new S3Client({
  endpoint,
  region: "auto",
  forcePathStyle: true,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

function validateConfig() {
  if (!endpoint) {
    throw new Error("ELASTICLAKE_ENDPOINT is not configured.");
  }

  if (!accessKeyId) {
    throw new Error("ELASTICLAKE_ACCESS_KEY is not configured.");
  }

  if (!secretAccessKey) {
    throw new Error("ELASTICLAKE_SECRET_KEY is not configured.");
  }

  if (!bucket) {
    throw new Error("ELASTICLAKE_BUCKET is not configured.");
  }
}

async function testConnection() {
  validateConfig();

  await s3.send(
    new HeadBucketCommand({
      Bucket: bucket,
    })
  );

  return true;
}

async function uploadFile(filePath, storageKey, mimeType) {
  validateConfig();

  const fileStream = fs.createReadStream(filePath);

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: storageKey,
      Body: fileStream,
      ContentType: mimeType,
    })
  );

  return {
    key: storageKey,
    bucket,
  };
}

async function downloadFile(storageKey, res, contentType) {
  validateConfig();

  const response = await s3.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: storageKey,
    })
  );

  if (contentType) {
    res.setHeader("Content-Type", contentType);
  }

  response.Body.pipe(res);
}

async function deleteFile(storageKey) {
  validateConfig();

  await s3.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: storageKey,
    })
  );
}

module.exports = {
  testConnection,
  uploadFile,
  downloadFile,
  deleteFile,
};
