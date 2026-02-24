import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BaService } from './ba.service';
import { BaCommands } from './ba.commands';
import { BaEmbeds } from './ba.embeds';
import { BaCronService } from './ba.cron';
import { NotifyChannel, NotifyChannelSchema } from './ba.schemas';

@Module({
  imports: [
    // Separate Mongoose connection for SchaleDB
    MongooseModule.forRootAsync({
      connectionName: 'ba',
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI_BA'),
      }),
      inject: [ConfigService],
    }),
    // NotifyChannel on the default connection
    MongooseModule.forFeature([
      { name: NotifyChannel.name, schema: NotifyChannelSchema },
    ]),
  ],
  providers: [BaService, BaCommands, BaEmbeds, BaCronService],
  exports: [BaService],
})
export class BlueArchiveModule {}
