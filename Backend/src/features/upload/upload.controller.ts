import type { Request, Response } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { ApiError } from '../../lib/errors';
import { asyncHandler, sendSuccess } from '../../lib/http';
import type { UploadResponse } from './upload.types';

const isConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const uploadToCloudinary = async (buffer: Buffer, filename: string) => {
  if (!isConfigured) {
    throw new ApiError(500, 'Cloudinary is not configured.');
  }

  return await new Promise<{ secure_url: string; public_id: string; resource_type: string; bytes: number }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        folder: process.env.CLOUDINARY_FOLDER || 'uploads',
        public_id: filename.replace(/\.[^/.]+$/, ''),
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error('Upload failed.'));
          return;
        }

        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
          resource_type: result.resource_type,
          bytes: result.bytes,
        });
      }
    );

    stream.end(buffer);
  });
};

export const uploadSingleMiddleware = upload.single('file');

export const uploadSingleController = asyncHandler(async (req: Request, res: Response<UploadResponse>) => {
  if (!req.file) {
    throw new ApiError(400, 'Validation failed.', ['file is required.']);
  }

  const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${req.file.originalname}`;
  const result = await uploadToCloudinary(req.file.buffer, uniqueName);

  sendSuccess(res, {
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
