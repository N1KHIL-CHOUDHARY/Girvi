const express = require('express');
const router = express.Router();
const { generateNotice } = require('../../../controllers/pdf');

router.get('/notice/:ticketId', generateNotice);

module.exports = router;


