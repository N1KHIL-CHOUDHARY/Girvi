const express = require('express');
const router = express.Router();
// Import all the controller functions we need
const { 
  createPawnTicket, 
  getPawnTickets,
  getPawnTicketById,  // <-- You were missing this
  updatePawnTicket,  // <-- You were missing this
  deletePawnTicket,  // <-- You were missing this
  settlePawnTicket   // <-- You were missing this
} = require('../../../controllers/pawn.js');
const { authenticate, authorize } = require('../../../middlewares/auth.js'); // <-- Import authorize
const validate = require('../../../middlewares/validate.js');
const { pawnTicketSchema } = require('../../../utils/validators.js');

router.use(authenticate);

router.route('/')
  .post(validate(pawnTicketSchema), createPawnTicket)
  .get(getPawnTickets);

router.route('/:id')
  .get(getPawnTicketById)                           
  .patch(validate(pawnTicketSchema), updatePawnTicket); 

router.delete('/:id', authorize('owner'), deletePawnTicket); 

router.patch('/:id/settle', settlePawnTicket);

module.exports = router;