import { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import { logger } from '../lib/logger';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const requestId = (req.headers['x-request-id'] as string) || crypto.randomUUID();
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || (statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST');
  const message = statusCode >= 500 && process.env.NODE_ENV === 'production'
    ? 'An unexpected error occurred. Please try again later.'
    : err.message || 'Unknown error';

  logger.error({
    requestId,
    errorCode,
    statusCode,
    path: req.originalUrl,
    method: req.method,
    message: err.message,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
  });

  res.status(statusCode).json({
    error: {
      code: errorCode,
      message,
      requestId,
      ...(err.details && process.env.NODE_ENV !== 'production' ? { details: err.details } : {}),
    },
  });
}
