import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    console.log('WebSocket Gateway inicializado');
  }

  handleConnection(client: Socket) {
    console.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Cliente desconectado: ${client.id}`);
  }

  // Método para emitir eventos a un cliente específico o a su canal
  emitToUser(usuarioId: string, event: string, data: any) {
    if (this.server) {
      this.server.emit(`${event}-${usuarioId}`, data);
    }
  }

  // Método para emitir eventos de difusión global a todos los clientes conectados
  emitAll(event: string, data: any) {
    if (this.server) {
      this.server.emit(event, data);
    }
  }
}
