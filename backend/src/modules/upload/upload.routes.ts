import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { upload } from '../../common/middleware/upload.middleware';
import { sendResponse } from '../../common/utils/apiResponse';
import { ValidationError } from '../../common/errors/AppError';

const router = Router();

router.post(
  '/',
  authMiddleware,
  upload.single('file'),
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      return next(new ValidationError('Please provide a file to upload'));
    }

    // Build absolute file URL served statically
    const host = req.get('host');
    const protocol = req.protocol;
    const url = `${protocol}://${host}/uploads/${req.file.filename}`;

    sendResponse(res, {
      message: 'File uploaded successfully',
      data: { url }
    });
  }
);

export default router;
