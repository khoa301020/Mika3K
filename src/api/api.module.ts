import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { GuildsModule } from './guilds/guilds.module';
import { NotifyChannelsApiModule } from './notify-channels/notify-channels.module';
import { HoyolabApiModule } from './hoyolab/hoyolab-api.module';

@Module({
  imports: [
    AuthModule,
    HealthModule,
    GuildsModule,
    NotifyChannelsApiModule,
    HoyolabApiModule,
  ],
})
export class ApiModule {}
