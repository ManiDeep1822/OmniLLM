import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { MCPEvent } from '../types/dashboard';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [events, setEvents] = useState<MCPEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let s: Socket | null = null;

    async function findServerPort(): Promise<string> {
      for (const port of [3000, 3001, 3002, 3003]) {
        try {
          const res = await fetch(`http://localhost:${port}/api/health`);
          if (res.ok) return String(port);
        } catch {}
      }
      return '3000';
    }

    const startSocket = async () => {
      const port = await findServerPort();
      s = io(`http://localhost:${port}`, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        withCredentials: true
      });

      s.on('connect', () => setIsConnected(true));
      s.on('disconnect', () => setIsConnected(false));

      s.on('token', (event: MCPEvent) => {
        setEvents((prev) => [{ ...event, type: 'token' }, ...prev.slice(0, 99)]);
      });

      s.on('stream_complete', (event: MCPEvent) => {
        setEvents((prev) => [{ ...event, type: 'complete' }, ...prev.slice(0, 99)]);
      });

      s.on('stream_error', (event: MCPEvent) => {
        setEvents((prev) => [{ ...event, type: 'error' }, ...prev.slice(0, 99)]);
      });

      setSocket(s);
    };

    startSocket();

    return () => {
      if (s) {
        s.off('connect');
        s.off('disconnect');
        s.off('token');
        s.off('stream_complete');
        s.off('stream_error');
        s.disconnect();
      }
    };
  }, []);

  return { socket, events, isConnected };
};
