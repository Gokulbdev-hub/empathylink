import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'body.password',
      'body.token',
      'body.refreshToken',
      '*.passwordHash',
      '*.twoFactorSecret',
      '*.content', // Redact sensitive journal and message content from server log telemetry
    ],
    remove: true,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});
