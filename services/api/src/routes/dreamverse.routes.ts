import { Router } from 'express';
import { DREAMVERSE_UNIVERSES } from '@empathylink/config';
import { UniverseKey } from '@empathylink/types';

export const dreamverseRouter = Router();

// GET all universes
dreamverseRouter.get('/', (req, res) => {
  const list = Object.values(DREAMVERSE_UNIVERSES);
  res.json({ success: true, data: { universes: list } });
});

// GET specific universe by ID
dreamverseRouter.get('/:universeId', (req, res) => {
  const universeId = req.params.universeId.toUpperCase() as UniverseKey;
  const universe = DREAMVERSE_UNIVERSES[universeId];

  if (!universe) {
    return res.status(404).json({
      error: {
        code: 'UNIVERSE_NOT_FOUND',
        message: `Universe "${req.params.universeId}" does not exist.`,
        requestId: (req.headers['x-request-id'] as string) || 'req_univ',
      },
    });
  }

  res.json({ success: true, data: { universe } });
});
