import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';

interface SocketRequest<T = any> {
  requestId: string;
  eventName: string;
  payload: T;
}

interface SocketResponse<T = any> {
  requestId: string;
  data?: T;
  error?: string;
}

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000', // or '*' for all origins (not recommended for production)
    credentials: true,
  },
})
export class SocketIoGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  // In-memory message store for demo
  private messages: string[] = [];

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);

    // Listen for all 'request' events from this client
    client.on('request', (req: SocketRequest) =>
      this.handleRequest(client, req),
    );
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // Main request/response handler
  private handleRequest(client: Socket, req: SocketRequest) {
    const { requestId, eventName, payload } = req;

    if (!requestId || !eventName) {
      client.emit('response', {
        requestId,
        error: 'Invalid request',
      } as SocketResponse);
      return;
    }

    switch (eventName) {
      case 'getMessages':
        client.emit('response', {
          requestId,
          data: this.messages,
        } as SocketResponse<string[]>);
        break;

      case 'sendMessage':
        if (typeof payload?.message === 'string') {
          const msg = payload.message;
          this.messages.push(msg);

          // Respond to sender
          client.emit('response', {
            requestId,
            data: true,
          } as SocketResponse<boolean>);

          // Broadcast to all clients (including sender) as a real-time update
          client.broadcast.emit('newMessage', msg);
          // Optionally, also emit to sender for immediate feedback:
          client.emit('newMessage', msg);
        } else {
          client.emit('response', {
            requestId,
            error: 'Invalid message payload',
          } as SocketResponse);
        }
        break;

      default:
        client.emit('response', {
          requestId,
          error: `Unknown event: ${eventName}`,
        } as SocketResponse);
    }
  }
}
