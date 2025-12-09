const express = require('express');
const router = express.Router();
const { createPayment, getPaymentsForTicket } = require('../../../controllers/payment');
const { authenticate } = require('../../../middlewares/auth');

router.use(authenticate);

router.post('/', createPayment);
router.get('/ticket/:ticketId', getPaymentsForTicket);

module.exports = router;

