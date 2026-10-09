import { Router } from 'express';
import { db } from '../lib/db';
import { authenticateToken } from '../middlewares/auth';
import { validateBody } from '../middlewares/validate';
import {
  RegisterBirthdayCelebrationSchema,
  SendBirthdayWishSchema,
  SolBirthdayBlessingSchema,
} from '@empathylink/validation';
import { SolAiService } from '@empathylink/service-ai';

export const birthdayRouter = Router();
const solAi = new SolAiService();

// Get today's celebrants & global stats (public or auth-aware)
birthdayRouter.get('/', (req, res) => {
  const authHeader = req.headers.authorization;
  let currentUserId: string | undefined;

  // Optional auth to mark isCurrentUser
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      currentUserId = payload.userId;
    } catch (_) {
      // Ignored
    }
  }

  const celebrants = db.getBirthdayCelebrants(currentUserId);
  const stats = db.getBirthdayStats();

  res.json({
    success: true,
    data: {
      celebrants,
      stats,
    },
  });
});

// Get single celebrant & their wishes
birthdayRouter.get('/celebrants/:id', (req, res) => {
  const celebrant = db.getCelebrantById(req.params.id);
  if (!celebrant) {
    return res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: 'Birthday celebrant not found.',
        requestId: (req.headers['x-request-id'] as string) || 'req_bday',
      },
    });
  }

  const wishes = db.getWishesForCelebrant(req.params.id);

  res.json({
    success: true,
    data: {
      celebrant,
      wishes,
    },
  });
});

// Register birthday celebration
birthdayRouter.post(
  '/celebrate',
  authenticateToken,
  validateBody(RegisterBirthdayCelebrationSchema),
  (req, res) => {
    const celebrant = db.registerBirthdayCelebration(req.user!.userId, req.body);
    res.status(201).json({
      success: true,
      data: {
        celebrant,
        message: 'Happy Birthday! Your starlight candle has been placed in the global sanctuary.',
      },
    });
  }
);

// Send birthday wish to a celebrant
birthdayRouter.post(
  '/wish',
  authenticateToken,
  validateBody(SendBirthdayWishSchema),
  (req, res) => {
    try {
      const wish = db.sendBirthdayWish(req.user!.userId, req.body.celebrantId, {
        gift: req.body.gift,
        vibe: req.body.vibe,
        message: req.body.message,
      });

      res.status(201).json({
        success: true,
        data: {
          wish,
          message: 'Your warm birthday wish has traveled across the globe!',
        },
      });
    } catch (err: any) {
      res.status(404).json({
        error: {
          code: 'CELEBRANT_NOT_FOUND',
          message: err.message || 'Could not find celebrant.',
          requestId: (req.headers['x-request-id'] as string) || 'req_wish',
        },
      });
    }
  }
);

// Blow out birthday candle (interactive mindful micro-action)
birthdayRouter.post('/blow-candle/:id', (req, res) => {
  const celebrant = db.blowCelebrantCandle(req.params.id);
  if (!celebrant) {
    return res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: 'Celebrant not found.',
        requestId: (req.headers['x-request-id'] as string) || 'req_candle',
      },
    });
  }

  res.json({
    success: true,
    data: {
      celebrant,
      message: '✨ A gentle breath taken. May your wish gently take flight into the universe.',
    },
  });
});

// Sol AI Birthday Blessing
birthdayRouter.post(
  '/sol-blessing',
  authenticateToken,
  validateBody(SolBirthdayBlessingSchema),
  async (req, res) => {
    const persona = db.getPersonaByUserId(req.user!.userId);
    const name = req.body.celebrantName || persona?.displayName || 'Traveler';
    const universe = req.body.universe || persona?.universe || 'Cosmos';
    const mood = req.body.mood || 'Reflective';

    const prompt = `Write an uplifting, warm, non-clinical, non-medical birthday reflection for ${name} from the ${universe} universe. They are feeling ${mood}. Acknowledge another full orbit around the sun, remind them they matter, and provide a grounding wish for their upcoming journey. Keep it under 150 words.`;

    const solResponse = await solAi.chat({
      message: prompt,
      tonePreference: 'WARM',
    });

    res.json({
      success: true,
      data: {
        blessing: solResponse.reply,
        celebrantName: name,
        createdAt: new Date().toISOString(),
      },
    });
  }
);
