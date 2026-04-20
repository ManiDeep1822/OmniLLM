import { Server } from 'socket.io';
import { StreamEvent } from '../streaming/events.js';

let io: Server | null = null;

export const initSocket = (server: any) => {
  if (io) return io;
  
  io = new Server(server, {
    cors: {
      origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.error(`Dashboard client connected: ${socket.id}`);
  });

  return io;
};

export const getIO = () => io;

export const emitToDashboard = (eventName: string, data: any) => {
  if (io) {
    io.emit(eventName, data);
  }
};
