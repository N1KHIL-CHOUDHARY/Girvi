import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { uploadSingleController, uploadSingleMiddleware } from './upload.controller';

const router = Router();

router.post('/', authenticate, uploadSingleMiddleware, uploadSingleController);

export default router;
