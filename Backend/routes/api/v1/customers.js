const express = require('express');
const router = express.Router();
const { createCustomer, getCustomers,getCustomerById} = require('../../../controllers/customer.js');
const {getPawnTicketsForCustomer} = require('../../../controllers/pawn.js');
const { authenticate } = require('../../../middlewares/auth.js');
const validate = require('../../../middlewares/validate.js');
const { customerSchema } = require('../../../utils/validators.js');

router.use(authenticate);

router.post('/', validate(customerSchema), createCustomer);

router.get('/', getCustomers);

router.get('/:id',getCustomerById);

router.get("/:id/pawns",getPawnTicketsForCustomer);

module.exports = router;