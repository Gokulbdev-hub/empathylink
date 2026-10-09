import { Router } from 'express';
import { db } from '../lib/db';
import { authenticateToken } from '../middlewares/auth';

export const notificationsRouter = Router();

// Get user notifications
notificationsRouter.get('/', authenticateToken, (req, res) => {
  const notifications = db.getUserNotifications(req.user!.userId);
  res.json({ success: true, data: { notifications } });
});

// Mark notification read
notificationsRouter.post('/:id/read', authenticateToken, (req, res) => {
  const updated = db.markNotificationAsRead(req.user!.userId, req.params.id);
  res.json({ success: true, data: { notification: updated } });
});
