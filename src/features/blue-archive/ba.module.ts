import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { BaCronService } from './ba.cron';
import { BaEmbeds } from './ba.embeds';
import { NotifyChannel, NotifyChannelSchema } from './ba.schemas';
import { BaService } from './ba.service';
import { BaCommandProviders } from './commands';

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
  providers: [BaService, BaEmbeds, BaCronService, ...BaCommandProviders],
  exports: [BaService],
})
export class BlueArchiveModule {}
