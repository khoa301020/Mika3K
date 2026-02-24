import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HoyolabApiController } from './hoyolab-api.controller';
import { RedeemGateway } from './redeem.gateway';
import {
  ClaimHistory,
  ClaimHistorySchema,
} from './schemas/claim-history.schema';
import { HoyolabModule } from '../../features/hoyolab/hoyolab.module';
import { Hoyolab, HoyolabSchema } from '../../features/hoyolab/hoyolab.schema';

@Module({
  imports: [
    HoyolabModule,
    MongooseModule.forFeature([
      { name: ClaimHistory.name, schema: ClaimHistorySchema },
      { name: Hoyolab.name, schema: HoyolabSchema },
    ]),
  ],
  controllers: [HoyolabApiController],
  providers: [RedeemGateway],
})
export class HoyolabApiModule {}
