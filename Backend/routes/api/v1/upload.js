const express = require('express');
const router = express.Router();
const { authenticate } = require('../../../middlewares/auth');
const { uploadSingle } = require('../../../controllers/upload');

router.post('/', authenticate, uploadSingle);

module.exports = router;


