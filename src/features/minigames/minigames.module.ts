import { Module } from '@nestjs/common';
import { MinigamesCommandProviders } from './commands';

@Module({
  providers: [...MinigamesCommandProviders],
})
export class MinigamesModule {}
