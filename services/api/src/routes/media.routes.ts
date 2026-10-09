import { Router } from 'express';
import multer from 'multer';
import { authenticateToken } from '../middlewares/auth';
import { mediaStorage } from '../lib/storage';

export const mediaRouter = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

mediaRouter.post('/upload', authenticateToken, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: {
          code: 'FILE_MISSING',
          message: 'No file provided in form-data field "file".',
          requestId: (req.headers['x-request-id'] as string) || 'req_media',
        },
      });
    }

    const stored = await mediaStorage.saveMedia({
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      buffer: req.file.buffer,
      userId: req.user!.userId,
    });

    res.status(201).json({
      success: true,
      data: {
        media: stored,
      },
    });
  } catch (err: any) {
    res.status(400).json({
      error: {
        code: 'UPLOAD_FAILED',
        message: err.message,
        requestId: (req.headers['x-request-id'] as string) || 'req_media',
      },
    });
  }
});
