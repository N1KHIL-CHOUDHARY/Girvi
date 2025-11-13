const path = require('path');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const ApiError = require('../utils/ApiError');

const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

if (!isCloudinaryConfigured) {
  throw new Error(
    'Cloudinary is required but not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file.'
  );
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const memoryStorage = multer.memoryStorage();

const upload = multer({
  storage: memoryStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadBufferToCloudinary = (buffer, filename) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        folder: process.env.CLOUDINARY_FOLDER || 'uploads',
        public_id: filename ? filename.replace(/\.[^/.]+$/, '') : undefined,
      },
      (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve(result);
      }
    );
    uploadStream.end(buffer);
  });

const handleUpload = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Validation failed.', ['file is required.']);
  }

  const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const ext = path.extname(req.file.originalname || '');
  const publicBase = `${unique}${ext}`;

  const result = await uploadBufferToCloudinary(req.file.buffer, publicBase, req.file.mimetype);

  return sendSuccess(res, {
    status: 201,
    message: 'File uploaded successfully.',
    data: {
      url: result.secure_url,
      public_id: result.public_id,
      resource_type: result.resource_type,
      bytes: result.bytes,
    },
  });
});

const uploadSingle = [upload.single('file'), handleUpload];

module.exports = { uploadSingle };
