import { io, Socket } from 'socket.io-client';
import { nanoid } from 'nanoid';
import { PendingRequest, SocketRequest, SocketResponse } from '../types/socket';
import { useSocketStore } from '../store/socketStore';

let pendingRequests = new Map<string, PendingRequest>();

export const initializeSocket = (
  url: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
) => {
  let socket = useSocketStore.getState().socket;
  if (socket) return true;

  socket = io(url, {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  useSocketStore.getState().setSocket(socket);
  useSocketStore.getState().setStatus('connecting');
  socket.on('connect', () => {
    console.log('Socket connected!');
    useSocketStore.getState().setStatus('connected');
  });

  socket.on('connect_error', (error: Error) => {
    console.error('Socket connection error:', error);
    useSocketStore.getState().setStatus('disconnected');
  });

  socket.on('disconnect', (reason: string) => {
    console.log('Socket disconnected:', reason);
    pendingRequests.forEach((pendingRequest) => {
      pendingRequest.reject(new Error('Socket disconnected'));
    });
    pendingRequests.clear();
    useSocketStore.getState().clearSocket();
  });

  socket.on('response', (response: SocketResponse) => {
    const { requestId, data, error } = response;
    const pendingRequest = pendingRequests.get(requestId);
    if (pendingRequest) {
      if (error) {
        pendingRequest.reject(new Error(error));
      } else {
        pendingRequest.resolve(data);
      }
      pendingRequests.delete(requestId);
    }
  });

  return true;
};

export const getSocket = (): Socket => {
  const socket = useSocketStore.getState().socket;
  if (!socket) {
    throw new Error('Socket not initialized. Call initializeSocket first.');
  }
  return socket;
};

export const socketRequest = <TResponse = any, TPayload = any>(
  eventName: string,
  payload: TPayload = {} as TPayload,
): Promise<TResponse> => {
  return new Promise<TResponse>((resolve, reject) => {
    const socket = getSocket();
    const requestId = nanoid();
    const timeoutId = setTimeout(() => {
      pendingRequests.delete(requestId);
      reject(new Error(`Request ${eventName} timed out`));
    }, 10000);
    pendingRequests.set(requestId, {
      resolve: (data: TResponse) => {
        clearTimeout(timeoutId);
        resolve(data);
      },
      reject: (error: Error) => {
        clearTimeout(timeoutId);
        reject(error);
      },
    });
    socket.emit('request', {
      requestId,
      eventName,
      payload,
    } as SocketRequest<TPayload>);
  });
};

export const registerListener = <T = any>(
  eventName: string,
  callback: (data: T) => void,
): (() => void) => {
  const socket = getSocket();
  socket.on(eventName, callback);
  return () => socket.off(eventName, callback);
};
