import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppLoggerService } from './logger.service';
import { ErrorLog, ErrorLogSchema } from './schemas/error-log.schema';
import { DatabaseLoggerListener } from './listeners/database-logger.listener';
import { DiscordLoggerListener } from './listeners/discord-logger.listener';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ErrorLog.name, schema: ErrorLogSchema },
    ]),
  ],
  providers: [AppLoggerService, DatabaseLoggerListener, DiscordLoggerListener],
  exports: [AppLoggerService],
})
export class LoggerModule {}
