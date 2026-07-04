import { Router } from 'express';
import Joi from 'joi';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.js';
import {
  changePasswordController,
  getMeController,
  getOAuthStateController,
  googleLoginController,
  loginController,
  logoutController,
  signupController,
  updatePreferencesController,
} from './auth.controller.js';

const router = Router();

const signupSchema = Joi.object({
  shop_name: Joi.string().min(3).max(100).required(),
  full_name: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  language: Joi.string().valid('en', 'hi', 'ta').optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});

const googleSchema = Joi.object({
  idToken: Joi.string().required(),
  state: Joi.string().required(),
});

const preferencesSchema = Joi.object({
  language: Joi.string().valid('en', 'hi', 'ta').required(),
});

router.post('/signup', validate(signupSchema), signupController);
router.post('/login', validate(loginSchema), loginController);
router.post('/logout', logoutController);
router.post('/change-password', authenticate, validate(changePasswordSchema), changePasswordController);
router.get('/oauth/state', getOAuthStateController);
router.post('/google', validate(googleSchema), googleLoginController);
router.get('/me', authenticate, getMeController);
router.put('/preferences', authenticate, validate(preferencesSchema), updatePreferencesController);

export default router;
