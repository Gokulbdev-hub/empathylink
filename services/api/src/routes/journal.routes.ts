import { Router } from 'express';
import { db } from '../lib/db';
import { authenticateToken } from '../middlewares/auth';
import { validateBody } from '../middlewares/validate';
import {
  CreateJournalEntrySchema,
  UpdateJournalEntrySchema,
  SolReflectionRequestSchema,
} from '@empathylink/validation';
import { SolAiService } from '@empathylink/service-ai';
import { solRateLimiter } from '../middlewares/rateLimiter';

export const journalRouter = Router();
const solAi = new SolAiService();

// List private journal entries
journalRouter.get('/', authenticateToken, (req, res) => {
  const entries = db.getUserJournalEntries(req.user!.userId);
  res.json({ success: true, data: { entries } });
});

// Create entry
journalRouter.post('/', authenticateToken, validateBody(CreateJournalEntrySchema), (req, res) => {
  const entry = db.createJournalEntry(req.user!.userId, req.body);
  res.status(201).json({ success: true, data: { entry } });
});

// Get single entry by ID
journalRouter.get('/:id', authenticateToken, (req, res) => {
  const entry = db.getJournalEntryById(req.params.id);
  if (!entry || entry.userId !== req.user!.userId) {
    return res.status(404).json({
      error: {
        code: 'ENTRY_NOT_FOUND',
        message: 'Journal entry not found or access denied.',
        requestId: (req.headers['x-request-id'] as string) || 'req_jrn',
      },
    });
  }
  res.json({ success: true, data: { entry } });
});

// Update entry (autosave endpoint)
journalRouter.put('/:id', authenticateToken, validateBody(UpdateJournalEntrySchema), (req, res) => {
  try {
    const updated = db.updateJournalEntry(req.params.id, req.user!.userId, req.body);
    res.json({ success: true, data: { entry: updated } });
  } catch (err: any) {
    res.status(400).json({
      error: {
        code: 'UPDATE_FAILED',
        message: err.message,
        requestId: (req.headers['x-request-id'] as string) || 'req_jrn',
      },
    });
  }
});

// Delete entry
journalRouter.delete('/:id', authenticateToken, (req, res) => {
  const ok = db.deleteJournalEntry(req.params.id, req.user!.userId);
  if (!ok) {
    return res.status(404).json({
      error: {
        code: 'ENTRY_NOT_FOUND',
        message: 'Journal entry not found or access denied.',
        requestId: (req.headers['x-request-id'] as string) || 'req_jrn',
      },
    });
  }
  res.json({ success: true, message: 'Journal entry permanently removed.' });
});

// User-triggered "Reflect with Sol"
journalRouter.post(
  '/:id/reflect',
  authenticateToken,
  solRateLimiter,
  validateBody(SolReflectionRequestSchema),
  async (req, res, next) => {
    try {
      const entry = db.getJournalEntryById(req.params.id);
      if (!entry || entry.userId !== req.user!.userId) {
        return res.status(404).json({
          error: {
            code: 'ENTRY_NOT_FOUND',
            message: 'Journal entry not found or access denied.',
            requestId: (req.headers['x-request-id'] as string) || 'req_jrn_ref',
          },
        });
      }

      const privacy = db.getPrivacySettings(req.user!.userId);
      if (!privacy.allowSolJournalReflection) {
        return res.status(403).json({
          error: {
            code: 'AI_REFLECTION_DISABLED',
            message: 'AI reflection is currently disabled in your privacy settings.',
            requestId: (req.headers['x-request-id'] as string) || 'req_jrn_ref',
          },
        });
      }

      const { reflectionType, targetLanguage } = req.body;
      const reflectionResult = await solAi.reflectJournal(
        entry.title,
        entry.content,
        reflectionType,
        targetLanguage
      );

      const savedReflection = db.addJournalReflection(entry.id, reflectionResult);

      res.json({
        success: true,
        data: {
          reflection: savedReflection,
          disclosure: 'Explicit disclosure: This entry was processed strictly on-demand for reflection. It is never used to train public AI models.',
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// Lock journal entry
journalRouter.post('/:id/lock', authenticateToken, (req, res) => {
  const updated = db.updateJournalEntry(req.params.id, req.user!.userId, { isLocked: true });
  res.json({ success: true, data: { entry: updated } });
});

// Unlock journal entry
journalRouter.post('/:id/unlock', authenticateToken, (req, res) => {
  const updated = db.updateJournalEntry(req.params.id, req.user!.userId, { isLocked: false });
  res.json({ success: true, data: { entry: updated } });
});
