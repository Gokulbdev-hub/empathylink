import { Router } from 'express';
import { db } from '../lib/db';
import { authenticateToken } from '../middlewares/auth';
import { validateBody } from '../middlewares/validate';
import { SubmitReportSchema, BlockUserSchema } from '@empathylink/validation';

export const reportRouter = Router();
export const blockRouter = Router();

// Submit safety report — mounted at /api/v1/reports
reportRouter.post('/', authenticateToken, validateBody(SubmitReportSchema), (req, res) => {
  const report = db.addReport(req.user!.userId, req.body);
  res.status(201).json({
    success: true,
    data: {
      report,
      message: 'Thank you for keeping our community safe. Our moderation team has received your report.',
    },
  });
});

// Block user — mounted at /api/v1/blocks
blockRouter.post('/', authenticateToken, validateBody(BlockUserSchema), (req, res) => {
  db.blockUser(req.user!.userId, req.body.blockedUserId);
  res.json({ success: true, message: 'User blocked. You will not see their messages or matches.' });
});

// Unblock user
blockRouter.delete('/:userId', authenticateToken, (req, res) => {
  db.unblockUser(req.user!.userId, req.params.userId);
  res.json({ success: true, message: 'User unblocked.' });
});
