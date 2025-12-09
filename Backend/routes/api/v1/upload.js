const express = require('express');
const router = express.Router();
const { uploadSingle } = require('../../../controllers/upload');

router.post('/', uploadSingle);

module.exports = router;


