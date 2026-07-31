import { Router, Request, Response } from 'express';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { upload } from '../../common/middleware/upload.middleware';
import { sendSuccess } from '../../common/utils/apiResponse';
import { ValidationError } from '../../common/errors/AppError';
import { asyncHandler } from '../../common/utils/asyncHandler';

const router = Router();

router.post(
  '/',
  authMiddleware,
  upload.single('file'),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      throw new ValidationError('Please provide a file to upload');
    }

    const host = req.get('host');
    const protocol = req.protocol;
    const url = `${protocol}://${host}/uploads/${req.file.filename}`;

    sendSuccess(res, { url }, 'File uploaded successfully');
  })
);

export default router;
