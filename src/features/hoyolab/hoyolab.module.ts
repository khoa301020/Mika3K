import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Hoyolab, HoyolabSchema } from './hoyolab.schema';
import { HoyolabService } from './hoyolab.service';
import { HoyolabCommands } from './hoyolab.commands';
import { HoyolabEmbeds } from './hoyolab.embeds';
import { HoyolabCron } from './hoyolab.cron';
import { HoYoLABConstants } from './hoyolab.constants';
import { AppHttpModule } from '../../shared/http';
import { AppCacheModule } from '../../shared/cache';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Hoyolab.name, schema: HoyolabSchema }]),
    AppHttpModule,
    AppCacheModule,
  ],
  providers: [
    HoyolabService,
    HoyolabEmbeds,
    HoyolabCommands,
    HoyolabCron,
    HoYoLABConstants,
  ],
  exports: [HoyolabService],
})
export class HoyolabModule {}
