const express = require('express');
const router = express.Router();
const { getMe } = require('../../../controllers/app.js');

router.get('/me', getMe);

module.exports = router;