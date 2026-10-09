import { Router } from 'express';
import { db } from '../lib/db';
import { authenticateToken } from '../middlewares/auth';
import { validateBody } from '../middlewares/validate';
import { CreateWellnessSessionSchema, CreateMoodEntrySchema } from '@empathylink/validation';

export const wellnessRouter = Router();

// Get wellness dashboard data
wellnessRouter.get('/', authenticateToken, (req, res) => {
  const userId = req.user!.userId;
  const moodHistory = db.getUserMoodEntries(userId);
  const recentSessions = db.wellnessSessions.get(userId) || [];

  res.json({
    success: true,
    data: {
      moodHistory,
      recentSessions,
      notice: 'EmpathyLink Wellness activities are gentle personal grounding rituals. They do not constitute medical or psychiatric care.',
    },
  });
});

// Log wellness session
wellnessRouter.post('/session', authenticateToken, validateBody(CreateWellnessSessionSchema), (req, res) => {
  const session = db.addWellnessSession(req.user!.userId, req.body);
  res.status(201).json({ success: true, data: { session } });
});

// Log mood check-in
wellnessRouter.post('/mood', authenticateToken, validateBody(CreateMoodEntrySchema), (req, res) => {
  const entry = db.addMoodEntry(req.user!.userId, req.body);
  res.status(201).json({ success: true, data: { moodEntry: entry } });
});

// Get mood history
wellnessRouter.get('/mood', authenticateToken, (req, res) => {
  const history = db.getUserMoodEntries(req.user!.userId);
  res.json({ success: true, data: { history } });
});
