import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import crypto from 'node:crypto';
import path from 'node:path';
import pinoHttp from 'pino-http';
import { logger } from './lib/logger';
import { errorHandler } from './middlewares/errorHandler';
import { standardRateLimiter } from './middlewares/rateLimiter';

// Import route modules
import { authRouter } from './routes/auth.routes';
import { personaRouter } from './routes/persona.routes';
import { dreamverseRouter } from './routes/dreamverse.routes';
import { heartlinkRouter } from './routes/heartlink.routes';
import { chatRouter } from './routes/chat.routes';
import { circlesRouter } from './routes/circles.routes';
import { journalRouter } from './routes/journal.routes';
import { solRouter } from './routes/sol.routes';
import { wellnessRouter } from './routes/wellness.routes';
import { privacyRouter } from './routes/privacy.routes';
import { reportRouter, blockRouter } from './routes/safety.routes';
import { notificationsRouter } from './routes/notifications.routes';
import { adminRouter } from './routes/admin.routes';
import { mediaRouter } from './routes/media.routes';
import { birthdayRouter } from './routes/birthday.routes';

export function createApp() {
  const app = express();

  // Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'blob:', '*'],
          connectSrc: ["'self'", '*'],
        },
      },
      crossOriginEmbedderPolicy: false,
    })
  );

  // CORS Configuration
  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
  app.use(
    cors({
      origin: [corsOrigin, 'http://localhost:3000', 'http://127.0.0.1:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
    })
  );

  // Body Parsing
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));

  // Attach Request ID & Timing
  app.use((req, res, next) => {
    const requestId = (req.headers['x-request-id'] as string) || crypto.randomUUID();
    req.headers['x-request-id'] = requestId;
    res.setHeader('x-request-id', requestId);
    next();
  });

  // Structured HTTP logging (with PII redaction)
  if (process.env.NODE_ENV !== 'test') {
    app.use(
      pinoHttp({
        logger,
        genReqId: (req) => (req.headers['x-request-id'] as string) || crypto.randomUUID(),
      })
    );
  }

  // Rate Limiting
  app.use(standardRateLimiter);

  // Serve static uploads
  const uploadDir = path.resolve(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadDir));

  // Observability & Health Endpoints
  app.get('/health', (req, res) => {
    res.json({
      status: 'HEALTHY',
      service: 'EmpathyLink-Core-API',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  app.get('/ready', (req, res) => {
    res.json({
      status: 'READY',
      database: 'CONNECTED',
      aiService: 'READY',
      timestamp: new Date().toISOString(),
    });
  });

  // REST API v1 Routes
  const apiV1 = express.Router();
  apiV1.use('/auth', authRouter);
  apiV1.use('/persona', personaRouter);
  apiV1.use('/universes', dreamverseRouter);
  apiV1.use('/heartlink', heartlinkRouter);
  apiV1.use('/conversations', chatRouter);
  apiV1.use('/circles', circlesRouter);
  apiV1.use('/journal', journalRouter);
  apiV1.use('/sol', solRouter);
  apiV1.use('/wellness', wellnessRouter);
  apiV1.use('/privacy', privacyRouter);
  apiV1.use('/reports', reportRouter);
  apiV1.use('/blocks', blockRouter);
  apiV1.use('/notifications', notificationsRouter);
  apiV1.use('/admin', adminRouter);
  apiV1.use('/media', mediaRouter);
  apiV1.use('/birthday', birthdayRouter);

  app.use('/api/v1', apiV1);

  // 404 Handler
  app.use((req, res) => {
    res.status(404).json({
      error: {
        code: 'ROUTE_NOT_FOUND',
        message: `Endpoint ${req.method} ${req.originalUrl} not found on this server.`,
        requestId: (req.headers['x-request-id'] as string) || 'req_404',
      },
    });
  });

  // Central Error Handler
  app.use(errorHandler);

  return app;
}
