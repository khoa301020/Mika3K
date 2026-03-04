import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppHttpModule } from '../../shared/http';
import { SyosetuCommandProviders } from './commands';
import { SyosetuCron } from './syosetu.cron';
import { SyosetuEmbeds } from './syosetu.embeds';
import { Syosetu, SyosetuSchema } from './syosetu.schema';
import { SyosetuService } from './syosetu.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Syosetu.name, schema: SyosetuSchema }]),
    AppHttpModule,
  ],
  providers: [SyosetuService, SyosetuCron, SyosetuEmbeds, ...SyosetuCommandProviders],
  exports: [SyosetuService],
})
export class SyosetuModule {}
