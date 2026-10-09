import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../lib/jwt';
import { UserRole } from '@empathylink/types';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication token required.',
        requestId: (req.headers['x-request-id'] as string) || 'req_auth',
      },
    });
  }

  try {
    const payload = await verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (err: any) {
    return res.status(401).json({
      error: {
        code: 'TOKEN_INVALID_OR_EXPIRED',
        message: 'Session token has expired or is invalid.',
        requestId: (req.headers['x-request-id'] as string) || 'req_auth',
      },
    });
  }
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required.',
          requestId: (req.headers['x-request-id'] as string) || 'req_role',
        },
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient administrative privileges.',
          requestId: (req.headers['x-request-id'] as string) || 'req_role',
        },
      });
    }

    next();
  };
}
