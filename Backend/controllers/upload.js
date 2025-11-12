const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Ensure uploads directory exists
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
	fs.mkdirSync(UPLOAD_DIR);
}

const storage = multer.diskStorage({
	destination: function (_req, _file, cb) {
		cb(null, UPLOAD_DIR);
	},
	filename: function (_req, file, cb) {
		const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
		const ext = path.extname(file.originalname || '');
		cb(null, `${unique}${ext}`);
	},
});

const upload = multer({
	storage,
	limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Single file upload handler
const uploadSingle = [
	upload.single('file'),
	(req, res) => {
		if (!req.file) {
			return res.status(400).json({ message: 'No file uploaded' });
		}
		// Public URL to access the file
		const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
		return res.status(201).json({
			message: 'File uploaded successfully',
			url: fileUrl,
			filename: req.file.filename,
			mimetype: req.file.mimetype,
			size: req.file.size,
		});
	},
];

module.exports = { uploadSingle };


