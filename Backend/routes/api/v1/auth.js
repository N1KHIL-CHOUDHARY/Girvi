const express = require('express');
const router = express.Router();
const { signup, login } = require('../../../controllers/auth.js');

const validate = require('../../../middlewares/validate.js'); 

const { signupSchema, loginSchema } = require('../../../utils/validators.js');

router.post('/signup', validate(signupSchema), signup); 

router.post('/login', validate(loginSchema), login);

module.exports = router;