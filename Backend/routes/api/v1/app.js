const express = require('express');
const router = express.Router();
const { getMe } = require('../../../controllers/app.js');
const { authenticate } = require('../../../middlewares/auth.js');

router.get('/me', authenticate, getMe);

module.exports = router;