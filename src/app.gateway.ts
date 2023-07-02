import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor() {}

  @WebSocketServer()
  private wss: Server;
  private logger: Logger = new Logger('AppGateway');

  afterInit(server: Server): void {
    this.logger.log('Initialized!');
    this.wss = server;
  }

  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('sender-join')
  handleSenderJoinEvent(client: Socket, data: any): void {
    client.join(data.uid);
  }

  @SubscribeMessage('receiver-join')
  handleReceiverJoinEvent(client: Socket, data: any): void {
    client.join(data.uid);
    client.in(data.sender_uid).emit('init', data.uid);
  }

  @SubscribeMessage('file-meta')
  handleFileMetadataEvent(client: Socket, data: any): void {
    client.in(data.uid).emit('fs-meta', data.metadata);
  }

  @SubscribeMessage('fs-start')
  handleFsStartEvent(client: Socket, data: any): void {
    client.in(data.uid).emit('fs-share', {});
  }

  @SubscribeMessage('file-raw')
  handleFileRawdataEvent(client: Socket, data: any): void {
    client.in(data.uid).emit('fs-share', data.buffer);
  }
}
