import { Router } from 'express';
import { db } from '../lib/db';
import { authenticateToken } from '../middlewares/auth';
import { validateBody } from '../middlewares/validate';
import { UpdatePrivacySettingsSchema } from '@empathylink/validation';

export const privacyRouter = Router();

// Get privacy settings
privacyRouter.get('/', authenticateToken, (req, res) => {
  const settings = db.getPrivacySettings(req.user!.userId);
  res.json({ success: true, data: { privacySettings: settings } });
});

// Update privacy settings
privacyRouter.put('/', authenticateToken, validateBody(UpdatePrivacySettingsSchema), (req, res) => {
  const updated = db.updatePrivacySettings(req.user!.userId, req.body);
  res.json({ success: true, data: { privacySettings: updated } });
});

// Export all personal user data
privacyRouter.post('/export', authenticateToken, (req, res) => {
  const userId = req.user!.userId;
  const user = db.findUserById(userId);
  const persona = db.getPersonaByUserId(userId);
  const privacySettings = db.getPrivacySettings(userId);
  const journals = db.getUserJournalEntries(userId);
  const moodHistory = db.getUserMoodEntries(userId);

  const exportBundle = {
    exportedAt: new Date().toISOString(),
    account: {
      id: user?.id,
      email: user?.email,
      role: user?.role,
      createdAt: user?.createdAt,
    },
    persona,
    privacySettings,
    journals: journals.map((j) => ({
      title: j.title,
      content: j.content,
      mood: j.moodTag,
      createdAt: j.createdAt,
    })),
    moodHistory,
  };

  res.json({
    success: true,
    data: {
      exportBundle,
      message: 'Your personal data export is ready.',
    },
  });
});

// Permanent Account Deletion
privacyRouter.post('/delete-account', authenticateToken, (req, res) => {
  const userId = req.user!.userId;
  const user = db.findUserById(userId);

  if (user) {
    user.deletedAt = new Date().toISOString();
  }

  // Revoke all sessions
  const userSessions = db.getUserSessions(userId);
  userSessions.forEach((s) => db.revokeSession(s.id));

  // Anonymize Persona
  const persona = db.getPersonaByUserId(userId);
  if (persona) {
    persona.displayName = 'Deleted Traveler';
    persona.bio = '';
    persona.motto = '';
  }

  res.json({
    success: true,
    message: 'Your account and associated identity have been removed in accordance with the data retention policy.',
  });
});
