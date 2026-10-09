import { Router } from 'express';
import { db } from '../lib/db';
import { authenticateToken } from '../middlewares/auth';
import { validateBody } from '../middlewares/validate';
import { PersonaUpdateSchema, DreamVerseSelectSchema } from '@empathylink/validation';
import { DREAMVERSE_UNIVERSES } from '@empathylink/config';
import { generatePublicCode } from '../lib/crypto';

export const personaRouter = Router();

personaRouter.get('/', authenticateToken, (req, res) => {
  const persona = db.getPersonaByUserId(req.user!.userId);
  if (!persona) {
    return res.status(404).json({
      error: {
        code: 'PERSONA_NOT_FOUND',
        message: 'No DreamVerse persona configured for this user.',
        requestId: (req.headers['x-request-id'] as string) || 'req_per',
      },
    });
  }
  res.json({ success: true, data: { persona } });
});

personaRouter.put('/', authenticateToken, validateBody(PersonaUpdateSchema), (req, res) => {
  try {
    const updated = db.updatePersona(req.user!.userId, req.body);
    res.json({ success: true, data: { persona: updated } });
  } catch (err: any) {
    res.status(400).json({
      error: {
        code: 'UPDATE_FAILED',
        message: err.message,
        requestId: (req.headers['x-request-id'] as string) || 'req_per',
      },
    });
  }
});

personaRouter.put('/dreamverse', authenticateToken, validateBody(DreamVerseSelectSchema), (req, res) => {
  const { universe, lifestyle, lifetimePath, dreamTheme, aura, title, motto } = req.body;
  const universeConfig = DREAMVERSE_UNIVERSES[universe];

  const updated = db.updatePersona(req.user!.userId, {
    universe,
    publicCode: generatePublicCode(universe),
    lifestyle,
    lifetimePath,
    dreamTheme,
    aura: aura || universeConfig.aura,
    title: title || 'Kindred Traveler',
    motto: motto || universeConfig.motto,
  });

  res.json({
    success: true,
    data: {
      persona: updated,
      universeDetails: universeConfig,
    },
  });
});
