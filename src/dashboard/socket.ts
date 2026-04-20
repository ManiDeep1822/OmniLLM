import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: Server | null = null;

export function initSocket(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174'
      ],
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  io.on('connection', (socket) => {
    console.error(`Dashboard client connected: ${socket.id}`);
    socket.on('disconnect', () => {
      console.error(`Dashboard client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO() {
  return io;
}

export const emitToDashboard = (event: string, data: any) => {
  const ioInstance = getIO();
  if (ioInstance) {
    ioInstance.emit(event, data);
  } else {
    console.error('Socket.IO not initialized, cannot emit:', event);
  }
};
