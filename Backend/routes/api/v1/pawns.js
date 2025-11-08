// Pawn routes
const express = require('express');
const router = express.Router();
const { createPawnTicket, getPawnTickets } = require('../../../controllers/pawn.js');
const { authenticate } = require('../../../middlewares/auth.js');
const validate = require('../../../middlewares/validate.js');
const { pawnTicketSchema } = require('../../../utils/validators.js');

// All routes in this file are protected
router.use(authenticate);

router.post('/', validate(pawnTicketSchema), createPawnTicket);

router.get('/', getPawnTickets);

module.exports = router;