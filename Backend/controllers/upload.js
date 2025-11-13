const path = require('path');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Validate Cloudinary configuration
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

// Configure Cloudinary
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
	secure: true,
});

// Use memory storage since we'll upload directly to Cloudinary
const memoryStorage = multer.memoryStorage();

const upload = multer({
	storage: memoryStorage,
	limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const uploadBufferToCloudinary = (buffer, filename, mimetype) => {
	return new Promise((resolve, reject) => {
		const uploadStream = cloudinary.uploader.upload_stream(
			{
				resource_type: 'auto',
				folder: process.env.CLOUDINARY_FOLDER || 'uploads',
				public_id: filename ? filename.replace(/\.[^/.]+$/, '') : undefined,
			},
			(err, result) => {
				if (err) return reject(err);
				resolve(result);
			}
		);
		uploadStream.end(buffer);
	});
};

// Single file upload handler - Cloudinary only
const uploadSingle = [
	upload.single('file'),
	async (req, res) => {
		if (!req.file) {
			return res.status(400).json({ message: 'No file uploaded' });
		}

		try {
			const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
			const ext = path.extname(req.file.originalname || '');
			const publicBase = `${unique}${ext}`;

			const result = await uploadBufferToCloudinary(req.file.buffer, publicBase, req.file.mimetype);

			return res.status(201).json({
				message: 'File uploaded successfully',
				url: result.secure_url,
				public_id: result.public_id,
				resource_type: result.resource_type,
				bytes: result.bytes,
			});
		} catch (error) {
			console.error('UPLOAD ERROR:', error);
			return res.status(500).json({ 
				message: 'Upload failed',
				error: error.message 
			});
		}
	},
];

module.exports = { uploadSingle };


