import rateLimit from 'express-rate-limit';
import { SECURITY_CONFIG } from '@empathylink/config';

export const standardRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: SECURITY_CONFIG.RATE_LIMITS.API_STANDARD_PER_MINUTE,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please slow down.',
        requestId: (req.headers['x-request-id'] as string) || 'req_ratelimit',
      },
    });
  },
});

export const authRateLimiter = rateLimit({
  windowMs: SECURITY_CONFIG.RATE_LIMITS.AUTH_WINDOW_MS,
  max: SECURITY_CONFIG.RATE_LIMITS.AUTH_ATTEMPTS_PER_WINDOW,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: {
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
        message: 'Too many authentication attempts. Please wait 15 minutes before trying again.',
        requestId: (req.headers['x-request-id'] as string) || 'req_auth_limit',
      },
    });
  },
});

export const solRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: SECURITY_CONFIG.RATE_LIMITS.SOL_PER_MINUTE,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: {
        code: 'SOL_RATE_LIMIT_EXCEEDED',
        message: 'Sol is reflecting. Please take a breath and try again shortly.',
        requestId: (req.headers['x-request-id'] as string) || 'req_sol_limit',
      },
    });
  },
});
