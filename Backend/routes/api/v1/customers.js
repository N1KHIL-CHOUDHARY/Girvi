const express = require('express');
const router = express.Router();
// Import all the controller functions we need
const { 
  createCustomer, 
  getCustomers, 
  getCustomerById,
  updateCustomer,    // <-- You were missing this
  deleteCustomer     // <-- You were missing this
} = require('../../../controllers/customer.js');
const { getPawnTicketsForCustomer } = require('../../../controllers/pawn.js');
const { getCustomerStats } = require('../../../controllers/analytics.js');
const { authenticate, authorize } = require('../../../middlewares/auth.js'); // <-- Import authorize
const validate = require('../../../middlewares/validate.js');
const { customerSchema } = require('../../../utils/validators.js');

router.use(authenticate);

router.route('/')
  .get(getCustomers)
  .post(validate(customerSchema), createCustomer);

router.route('/:id')
  .get(getCustomerById)
  .patch(validate(customerSchema), updateCustomer) 
  .delete(authorize('owner'), deleteCustomer);      

router.get("/:id/pawns", getPawnTicketsForCustomer);
router.get('/:id/stats', getCustomerStats);

module.exports = router;