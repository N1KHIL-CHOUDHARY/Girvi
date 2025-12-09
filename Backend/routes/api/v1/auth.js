const express = require('express');
const router = express.Router();
const { signup, login, changePassword } = require('../../../controllers/auth.js');
const { authenticate } = require('../../../middlewares/auth.js');
const validate = require('../../../middlewares/validate.js'); 

const { signupSchema, loginSchema, changePasswordSchema } = require('../../../utils/validators.js');

router.post('/signup', validate(signupSchema), signup); 

router.post('/login', validate(loginSchema), login);



router.post('/change-password', authenticate, validate(changePasswordSchema), changePassword);

module.exports = router;