import { Module } from '@nestjs/common';
import { MinigamesCommands } from './minigames.commands';

@Module({
  providers: [MinigamesCommands],
})
export class MinigamesModule {}
