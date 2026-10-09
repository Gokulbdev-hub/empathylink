import http from 'node:http';
import dotenv from 'dotenv';
dotenv.config();

import { Server as SocketIOServer } from 'socket.io';
import { createApp } from './app';
import { logger } from './lib/logger';
import { verifyAccessToken } from './lib/jwt';
import { db } from './lib/db';
import { ChatService } from '@empathylink/service-chat';
import { ClientToServerEvents, ServerToClientEvents } from '@empathylink/types';

const PORT = Number(process.env.PORT) || 4000;
const app = createApp();
const server = http.createServer(app);

// Initialize Socket.IO Server
const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: {
    origin: [process.env.CORS_ORIGIN || 'http://localhost:3000', 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  },
  pingTimeout: 20000,
  pingInterval: 10000,
});

const chatService = new ChatService(io);

// Socket.IO Handshake Authentication Middleware
// NEVER trust client-provided user IDs — verify cryptographic JWT token
io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      (socket.handshake.headers.authorization && socket.handshake.headers.authorization.split(' ')[1]);

    if (!token) {
      return next(new Error('AUTHENTICATION_ERROR: Token required'));
    }

    const payload = await verifyAccessToken(token);
    const persona = db.getPersonaByUserId(payload.userId);

    if (!persona) {
      return next(new Error('AUTHENTICATION_ERROR: User persona missing'));
    }

    // Attach authenticated user to socket data
    (socket as any).user = {
      userId: payload.userId,
      persona,
    };

    next();
  } catch (err: any) {
    next(new Error('AUTHENTICATION_ERROR: Invalid or expired token'));
  }
});

io.on('connection', (socket) => {
  const user = (socket as any).user;
  logger.info({ msg: 'WebSocket Client Connected', userId: user.userId, socketId: socket.id });

  chatService.registerSocket(socket, user);
});

// Start listening
server.listen(PORT, () => {
  logger.info(`✨ EmpathyLink Core API running on port ${PORT}`);
  logger.info(`🌐 Health check available at: http://localhost:${PORT}/health`);
  logger.info(`🔗 REST API v1 root at: http://localhost:${PORT}/api/v1`);
});

// Graceful Shutdown
function handleShutdown(signal: string) {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  io.close(() => {
    server.close(() => {
      logger.info('HTTP & Socket.IO server closed.');
      process.exit(0);
    });
  });
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
