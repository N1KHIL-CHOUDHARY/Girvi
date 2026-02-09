const express = require('express');
const router = express.Router();
const { getMe, updatePreferences } = require('../../../controllers/app.js');
const { authenticate } = require('../../../middlewares/auth.js');

router.get('/me', authenticate, getMe);
router.put('/users/preferences', authenticate, updatePreferences);

module.exports = router;