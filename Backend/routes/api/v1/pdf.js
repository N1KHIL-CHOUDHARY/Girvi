const express = require('express');
const router = express.Router();
const { authenticate } = require('../../../middlewares/auth');
const { generateNotice } = require('../../../controllers/pdf');

router.get('/notice/:ticketId', authenticate, generateNotice);

module.exports = router;


