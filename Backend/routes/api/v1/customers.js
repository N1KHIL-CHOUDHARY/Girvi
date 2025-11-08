const express = require('express');
const router = express.Router();
const { createCustomer, getCustomers } = require('../../../controllers/customer.js');
const { authenticate } = require('../../../middlewares/auth.js');
const validate = require('../../../middlewares/validate.js');
const { customerSchema } = require('../../../utils/validators.js');

router.use(authenticate);

router.post('/', validate(customerSchema), createCustomer);

router.get('/', getCustomers);

module.exports = router;