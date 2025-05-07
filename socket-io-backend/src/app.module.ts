import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SocketIoGateway } from './socket-io.gateway';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, SocketIoGateway],
})
export class AppModule {}
