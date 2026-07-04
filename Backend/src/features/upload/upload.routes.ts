import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { uploadSingleController, uploadSingleMiddleware } from './upload.controller.js';

const router = Router();

router.post('/', authenticate, uploadSingleMiddleware, uploadSingleController);

export default router;
