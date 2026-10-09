import { Server, Socket } from 'socket.io';
import {
  ClientToServerEvents,
  ServerToClientEvents,
  PersonaSummary,
  MessageDto,
} from '@empathylink/types';

export interface AuthenticatedSocketUser {
  userId: string;
  persona: PersonaSummary;
}

export class ChatService {
  private io: Server<ClientToServerEvents, ServerToClientEvents>;
  private activeUsers = new Map<string, string>(); // userId -> socketId
  private roomPresences = new Map<string, Set<string>>(); // roomId -> Set of userIds

  constructor(io: Server<ClientToServerEvents, ServerToClientEvents>) {
    this.io = io;
  }

  public registerSocket(socket: Socket<ClientToServerEvents, ServerToClientEvents>, user: AuthenticatedSocketUser) {
    this.activeUsers.set(user.userId, socket.id);

    // Join user's individual notification room
    socket.join(`user:${user.userId}`);

    // Handle joining conversations
    socket.on('join:conversation', ({ conversationId }) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on('leave:conversation', ({ conversationId }) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // Handle temporary Echo Rooms & Silent Presence
    socket.on('join:room', ({ roomId, isSilent }) => {
      socket.join(`room:${roomId}`);
      if (!this.roomPresences.has(roomId)) {
        this.roomPresences.set(roomId, new Set());
      }
      this.roomPresences.get(roomId)?.add(user.userId);

      this.io.to(`room:${roomId}`).emit('presence:update', {
        userId: user.userId,
        status: isSilent ? 'SILENT' : 'ONLINE',
      });
    });

    socket.on('leave:room', ({ roomId }) => {
      socket.leave(`room:${roomId}`);
      this.roomPresences.get(roomId)?.delete(user.userId);
      this.io.to(`room:${roomId}`).emit('presence:update', {
        userId: user.userId,
        status: 'OFFLINE',
      });
    });

    // Typing Indicators
    socket.on('typing:start', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('typing:update', {
        conversationId,
        userPersona: user.persona,
        isTyping: true,
      });
    });

    socket.on('typing:stop', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('typing:update', {
        conversationId,
        userPersona: user.persona,
        isTyping: false,
      });
    });

    socket.on('disconnect', () => {
      this.activeUsers.delete(user.userId);
      for (const [roomId, members] of this.roomPresences.entries()) {
        if (members.has(user.userId)) {
          members.delete(user.userId);
          this.io.to(`room:${roomId}`).emit('presence:update', {
            userId: user.userId,
            status: 'OFFLINE',
          });
        }
      }
    });
  }

  public broadcastMessage(conversationId: string, message: MessageDto) {
    this.io.to(`conversation:${conversationId}`).emit('message:new', message);
  }

  public notifyUser(userId: string, notification: { id: string; title: string; body: string; type: string; url?: string }) {
    this.io.to(`user:${userId}`).emit('notification:new', notification);
  }
}
