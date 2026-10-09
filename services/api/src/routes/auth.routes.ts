import { Router } from 'express';
import crypto from 'node:crypto';
import { db } from '../lib/db';
import { hashPassword, verifyPassword } from '../lib/crypto';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../lib/jwt';
import { validateBody } from '../middlewares/validate';
import { authenticateToken } from '../middlewares/auth';
import { authRateLimiter } from '../middlewares/rateLimiter';
import { RegisterSchema, LoginSchema, RefreshTokenSchema, TwoFactorVerifySchema } from '@empathylink/validation';

export const authRouter = Router();

// Register new anonymous account
authRouter.post('/register', authRateLimiter, validateBody(RegisterSchema), async (req, res, next) => {
  try {
    const { email, password, deviceName, initialUniverse, displayName } = req.body;

    const existing = db.findUserByEmail(email);
    if (existing) {
      return res.status(409).json({
        error: {
          code: 'USER_ALREADY_EXISTS',
          message: 'An account with this email address already exists.',
          requestId: (req.headers['x-request-id'] as string) || 'req_reg',
        },
      });
    }

    const passwordHash = await hashPassword(password);
    const user = db.createUser({
      email,
      passwordHash,
      initialUniverse,
      displayName,
    });

    const persona = db.getPersonaByUserId(user.id);
    const accessToken = await signAccessToken({ userId: user.id, role: user.role, email: user.email });
    const refreshToken = await signRefreshToken({ userId: user.id, role: user.role, email: user.email });

    const session = db.createSession({
      userId: user.id,
      deviceName,
      refreshTokenHash: crypto.createHash('sha256').update(refreshToken).digest('hex'),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          persona,
        },
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: 900,
        },
        sessionId: session.id,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Login
authRouter.post('/login', authRateLimiter, validateBody(LoginSchema), async (req, res, next) => {
  try {
    const { email, password, deviceName } = req.body;

    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Incorrect email or password.',
          requestId: (req.headers['x-request-id'] as string) || 'req_login',
        },
      });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Incorrect email or password.',
          requestId: (req.headers['x-request-id'] as string) || 'req_login',
        },
      });
    }

    const persona = db.getPersonaByUserId(user.id);
    const accessToken = await signAccessToken({ userId: user.id, role: user.role, email: user.email });
    const refreshToken = await signRefreshToken({ userId: user.id, role: user.role, email: user.email });

    const session = db.createSession({
      userId: user.id,
      deviceName,
      refreshTokenHash: crypto.createHash('sha256').update(refreshToken).digest('hex'),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          persona,
        },
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: 900,
        },
        sessionId: session.id,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Refresh token
authRouter.post('/refresh', validateBody(RefreshTokenSchema), async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const payload = await verifyRefreshToken(refreshToken);
    const hash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    const session = db.findSessionByRefreshTokenHash(hash);
    if (!session) {
      return res.status(401).json({
        error: {
          code: 'SESSION_REVOKED',
          message: 'Session has been revoked or expired.',
          requestId: (req.headers['x-request-id'] as string) || 'req_ref',
        },
      });
    }

    // Rotate refresh token
    const newAccessToken = await signAccessToken({
      userId: payload.userId,
      role: payload.role,
      email: payload.email,
    });
    const newRefreshToken = await signRefreshToken({
      userId: payload.userId,
      role: payload.role,
      email: payload.email,
    });

    session.refreshTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
    session.lastActiveAt = new Date().toISOString();

    res.json({
      success: true,
      data: {
        tokens: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          expiresIn: 900,
        },
      },
    });
  } catch (err) {
    res.status(401).json({
      error: {
        code: 'TOKEN_INVALID_OR_EXPIRED',
        message: 'Invalid refresh token.',
        requestId: (req.headers['x-request-id'] as string) || 'req_ref',
      },
    });
  }
});

// Logout
authRouter.post('/logout', authenticateToken, async (req, res) => {
  if (req.user?.sessionId) {
    db.revokeSession(req.user.sessionId);
  }
  res.json({ success: true, message: 'Logged out successfully.' });
});

// Verify token
authRouter.get('/verify', authenticateToken, (req, res) => {
  const user = db.findUserById(req.user!.userId);
  const persona = db.getPersonaByUserId(req.user!.userId);
  const privacy = db.getPrivacySettings(req.user!.userId);

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        persona,
        privacySettings: privacy,
      },
    },
  });
});

// 2FA Enable
authRouter.post('/2fa/enable', authenticateToken, (req, res) => {
  const secret = crypto.randomBytes(20).toString('hex').slice(0, 16).toUpperCase();
  res.json({
    success: true,
    data: {
      secret,
      otpAuthUrl: `otpauth://totp/EmpathyLink:${req.user!.email}?secret=${secret}&issuer=EmpathyLink`,
      instructions: 'Enter code from authenticator to confirm activation.',
    },
  });
});

// 2FA Verify
authRouter.post('/2fa/verify', authenticateToken, validateBody(TwoFactorVerifySchema), (req, res) => {
  const user = db.findUserById(req.user!.userId);
  if (user) {
    user.twoFactorEnabled = true;
  }
  res.json({ success: true, message: 'Two-factor authentication successfully enabled.' });
});

// List sessions
authRouter.get('/sessions', authenticateToken, (req, res) => {
  const sessions = db.getUserSessions(req.user!.userId);
  res.json({
    success: true,
    data: {
      sessions: sessions.map((s) => ({
        id: s.id,
        deviceName: s.deviceName,
        ipAddress: s.ipAddress,
        createdAt: s.createdAt,
        lastActiveAt: s.lastActiveAt,
      })),
    },
  });
});

// Revoke session
authRouter.delete('/sessions/:sessionId', authenticateToken, (req, res) => {
  db.revokeSession(req.params.sessionId);
  res.json({ success: true, message: 'Session revoked.' });
});
