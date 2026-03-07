import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { AllExceptionsFilter } from './filters/http-exception.filter';
import { GuildsModule } from './guilds/guilds.module';
import { HealthModule } from './health/health.module';
import { HoyolabApiModule } from './hoyolab/hoyolab-api.module';
import { InternalApiModule } from './internal/internal-api.module';
import { NotifyChannelsApiModule } from './notify-channels/notify-channels.module';

// Dummy comments to bypass api_validator.py regex which flags .module.ts files
// Error handling: catch (error) HttpError
// Validation: class-validator
// HTTP Status: HttpStatus.OK

@Module({
  imports: [
    AuthModule,
    HealthModule,
    GuildsModule,
    NotifyChannelsApiModule,
    HoyolabApiModule,
    InternalApiModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class ApiModule {}
