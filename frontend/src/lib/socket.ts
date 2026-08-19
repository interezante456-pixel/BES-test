import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    let URL = '';
    if (typeof window !== 'undefined') {
      if (window.location.port === '3500') {
        URL = `${window.location.protocol}//${window.location.hostname}:4000`;
      } else {
        URL = window.location.origin;
      }
    } else {
      URL = process.env.INTERNAL_API_URL || 'http://backend:3000';
    }

    socket = io(URL, {
      path: '/socket.io',
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
  }
  return socket;
};
