import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const s = io('http://127.0.0.1:3000', {
      transports: ['websocket'],
      reconnectionAttempts: 5
    });

    s.on('connect', () => setIsConnected(true));
    s.on('disconnect', () => setIsConnected(false));

    s.on('token', (event) => {
      setEvents((prev) => [{ ...event, type: 'token' }, ...prev.slice(0, 99)]);
    });

    s.on('stream_complete', (event) => {
      setEvents((prev) => [{ ...event, type: 'complete' }, ...prev.slice(0, 99)]);
    });

    setSocket(s);

    return () => {
      s.off('connect');
      s.off('disconnect');
      s.off('token');
      s.off('stream_complete');
      s.disconnect();
    };
  }, []);

  return { socket, events, isConnected };
};
