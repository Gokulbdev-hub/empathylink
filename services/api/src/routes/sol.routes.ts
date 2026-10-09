import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth';
import { validateBody } from '../middlewares/validate';
import { solRateLimiter } from '../middlewares/rateLimiter';
import { SolChatInputSchema } from '@empathylink/validation';
import { SolAiService } from '@empathylink/service-ai';
import { SOL_SAFETY_NOTICE } from '@empathylink/config';

export const solRouter = Router();
const solAi = new SolAiService();

// Real-time Sol Chat
solRouter.post('/chat', authenticateToken, solRateLimiter, validateBody(SolChatInputSchema), async (req, res, next) => {
  try {
    const result = await solAi.chat(req.body);
    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

// Sol Reflection
solRouter.post('/reflect', authenticateToken, solRateLimiter, async (req, res, next) => {
  try {
    const { title, content, type } = req.body;
    const result = await solAi.reflectJournal(title || 'Reflection', content || '', type || 'GENTLE_REFLECTION');
    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

// Sol Summarize
solRouter.post('/summarize', authenticateToken, solRateLimiter, async (req, res, next) => {
  try {
    const { text } = req.body;
    const result = await solAi.reflectJournal('Summary', text || '', 'SUMMARIZE');
    res.json({
      success: true,
      data: {
        summary: result.output,
        disclaimer: SOL_SAFETY_NOTICE,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Sol Translate
solRouter.post('/translate', authenticateToken, solRateLimiter, async (req, res, next) => {
  try {
    const { text, targetLanguage } = req.body;
    const result = await solAi.reflectJournal('Translation', text || '', 'TRANSLATE', targetLanguage);
    res.json({
      success: true,
      data: {
        translatedText: result.output,
        targetLanguage,
        disclaimer: SOL_SAFETY_NOTICE,
      },
    });
  } catch (err) {
    next(err);
  }
});
