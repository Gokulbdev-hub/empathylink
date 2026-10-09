import { io, Socket } from 'socket.io-client';
import { api } from './api';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket && typeof window !== 'undefined') {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';
    socket = io(socketUrl, {
      auth: {
        token: api.getAccessToken(),
      },
      autoConnect: true,
      reconnectionAttempts: 5,
    });
  }
  return socket!;
}
