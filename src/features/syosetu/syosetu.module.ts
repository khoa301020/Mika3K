import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Syosetu, SyosetuSchema } from './syosetu.schema';
import { SyosetuService } from './syosetu.service';
import { SyosetuCommands } from './syosetu.commands';
import { SyosetuCron } from './syosetu.cron';
import { AppHttpModule } from '../../shared/http';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Syosetu.name, schema: SyosetuSchema }]),
    AppHttpModule,
  ],
  providers: [SyosetuService, SyosetuCommands, SyosetuCron],
  exports: [SyosetuService],
})
export class SyosetuModule {}
