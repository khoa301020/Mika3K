import { Module } from '@nestjs/common';
import { GuildsController } from './guilds.controller';

@Module({
  controllers: [GuildsController],
})
export class GuildsModule {}
