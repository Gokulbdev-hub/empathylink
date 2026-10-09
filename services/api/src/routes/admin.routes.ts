import { Router } from 'express';
import { db } from '../lib/db';
import { authenticateToken, requireRole } from '../middlewares/auth';
import { validateBody } from '../middlewares/validate';
import { ModerationActionSchema } from '@empathylink/validation';

export const adminRouter = Router();

// Require Moderator or Admin
adminRouter.use(authenticateToken, requireRole('ADMIN', 'MODERATOR'));

// List reports
adminRouter.get('/reports', (req, res) => {
  const status = req.query.status as any;
  const reports = db.getReports(status);
  res.json({ success: true, data: { reports } });
});

// Take action on report
adminRouter.post('/reports/:id/action', validateBody(ModerationActionSchema), (req, res) => {
  try {
    const { action, note } = req.body;
    const event = db.actionReport(req.params.id, req.user!.userId, action, note);
    res.json({ success: true, data: { moderationEvent: event } });
  } catch (err: any) {
    res.status(404).json({
      error: {
        code: 'REPORT_NOT_FOUND',
        message: err.message,
        requestId: (req.headers['x-request-id'] as string) || 'req_mod',
      },
    });
  }
});

// List moderation audit events
adminRouter.get('/moderation/events', (req, res) => {
  const events = Array.from(db.moderationEvents.values());
  res.json({ success: true, data: { events } });
});

// Admin system health & platform stats
adminRouter.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'HEALTHY',
      usersCount: db.users.size,
      activeSessionsCount: db.sessions.size,
      circlesCount: db.circles.size,
      reportsCount: db.reports.size,
      uptimeSeconds: process.uptime(),
      memoryUsage: process.memoryUsage(),
    },
  });
});
