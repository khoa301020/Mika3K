import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppCacheModule } from '../../shared/cache';
import { AppHttpModule } from '../../shared/http';
import { HoyolabCommandProviders } from './commands';
import { HoYoLABConstants } from './hoyolab.constants';
import { HoyolabCron } from './hoyolab.cron';
import { HoyolabEmbeds } from './hoyolab.embeds';
import { Hoyolab, HoyolabSchema } from './hoyolab.schema';
import { HoyolabService } from './hoyolab.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Hoyolab.name, schema: HoyolabSchema }]),
    AppHttpModule,
    AppCacheModule,
  ],
  providers: [
    HoyolabService,
    HoyolabEmbeds,
    HoyolabCron,
    HoYoLABConstants,
    ...HoyolabCommandProviders,
  ],
  exports: [HoyolabService],
})
export class HoyolabModule {}
