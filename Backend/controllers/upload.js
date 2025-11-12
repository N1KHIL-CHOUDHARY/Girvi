const path = require('path');
const fs = require('fs');
const multer = require('multer');
require('dotenv').config();

let cloudinary = null;
try {
	// Lazy-require to avoid crashing if package isn't installed
	cloudinary = require('cloudinary').v2;
} catch (_e) {
	cloudinary = null;
}

const isCloudinaryEnabled = Boolean(
	process.env.CLOUDINARY_CLOUD_NAME &&
	process.env.CLOUDINARY_API_KEY &&
	process.env.CLOUDINARY_API_SECRET
);

if (cloudinary && isCloudinaryEnabled) {
	cloudinary.config({
		cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
		api_key: process.env.CLOUDINARY_API_KEY,
		api_secret: process.env.CLOUDINARY_API_SECRET,
		secure: true,
	});
}

// Ensure uploads directory exists
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
	fs.mkdirSync(UPLOAD_DIR);
}

const diskStorage = multer.diskStorage({
	destination: function (_req, _file, cb) {
		cb(null, UPLOAD_DIR);
	},
	filename: function (_req, file, cb) {
		const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
		const ext = path.extname(file.originalname || '');
		cb(null, `${unique}${ext}`);
	},
});

const memoryStorage = multer.memoryStorage();

const upload = multer({
	storage: cloudinary && isCloudinaryEnabled ? memoryStorage : diskStorage,
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

// Single file upload handler
const uploadSingle = [
	upload.single('file'),
	async (req, res) => {
		if (!req.file) {
			return res.status(400).json({ message: 'No file uploaded' });
		}

		try {
			if (cloudinary && isCloudinaryEnabled) {
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
			} else {
				// Local disk fallback
				// Multer already wrote the file to disk when using diskStorage
				if (!req.file.path) {
					// If memoryStorage was used but cloudinary disabled/unavailable
					// write to disk manually
					const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(req.file.originalname || '')}`;
					const filePath = path.join(UPLOAD_DIR, filename);
					fs.writeFileSync(filePath, req.file.buffer);
					const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
					return res.status(201).json({
						message: 'File uploaded successfully',
						url: fileUrl,
						filename,
						mimetype: req.file.mimetype,
						size: req.file.size,
					});
				}

				const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
				return res.status(201).json({
					message: 'File uploaded successfully',
					url: fileUrl,
					filename: req.file.filename,
					mimetype: req.file.mimetype,
					size: req.file.size,
				});
			}
		} catch (error) {
			console.error('UPLOAD ERROR:', error);
			return res.status(500).json({ message: 'Upload failed' });
		}
	},
];

module.exports = { uploadSingle };


