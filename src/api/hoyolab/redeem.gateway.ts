import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { HoyolabService } from '../../features/hoyolab/hoyolab.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Hoyolab,
  HoyolabDocument,
} from '../../features/hoyolab/hoyolab.schema';

interface RedeemRequest {
  game: string;
  codes: string[];
  userIds: string[];
}

@WebSocketGateway({
  namespace: '/ws/redeem',
  cors: { origin: '*' },
})
export class RedeemGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RedeemGateway.name);

  constructor(
    private readonly hoyolabService: HoyolabService,
    @InjectModel(Hoyolab.name)
    private readonly hoyolabModel: Model<HoyolabDocument>,
  ) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  @SubscribeMessage('redeem')
  async handleRedeem(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: RedeemRequest,
  ) {
    const { game, codes, userIds } = data;

    if (!game || !codes?.length || !userIds?.length) {
      client.emit('error', { message: 'Missing game, codes, or userIds' });
      return;
    }

    if (codes.length > 10) {
      client.emit('error', { message: 'Maximum 10 codes per request' });
      return;
    }

    let total = 0;
    let success = 0;
    let failed = 0;

    // Fetch users
    const users = await this.hoyolabModel.find({
      _id: { $in: userIds },
    });

    if (users.length === 0) {
      client.emit('error', { message: 'No users found' });
      return;
    }

    client.emit('started', {
      totalCodes: codes.length,
      totalUsers: users.length,
    });

    for (const code of codes) {
      for (const user of users) {
        try {
          const results = await this.hoyolabService.redeemCode(
            user,
            game as any,
            code,
          );

          for (const result of results) {
            for (const account of result.accounts) {
              total++;
              const isSuccess = account.code === 0;
              if (isSuccess) success++;
              else failed++;

              client.emit('result', {
                code,
                remark: result.remark,
                nickname: account.nickname,
                uid: account.uid,
                status: isSuccess ? 'success' : 'failed',
                message: account.message,
              });
            }
          }
        } catch (err: any) {
          total++;
          failed++;
          client.emit('result', {
            code,
            userId: user._id,
            status: 'failed',
            message: err.message || 'Unknown error',
          });
        }

        // Rate limit delay
        await new Promise((r) => setTimeout(r, 5555));
      }
    }

    client.emit('completed', {
      summary: { total, success, failed },
    });
  }
}
