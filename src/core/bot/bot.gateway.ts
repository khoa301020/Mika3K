import { Injectable, Logger } from '@nestjs/common';
import { Once, On, Context } from 'necord';
import type { ContextOf } from 'necord';
import { Client } from 'discord.js';

@Injectable()
export class BotGateway {
  private readonly logger = new Logger(BotGateway.name);

  public constructor(private readonly client: Client) {}

  @Once('clientReady')
  public async onReady(@Context() [client]: ContextOf<'clientReady'>) {
    await this.client.guilds.fetch();
    this.logger.log(`Bot logged in as ${client.user.username}`);
    this.logger.log(`Serving ${this.client.guilds.cache.size} guilds`);
  }

  @On('warn')
  public onWarn(@Context() [message]: ContextOf<'warn'>) {
    this.logger.warn(message);
  }

  @On('error')
  public onError(@Context() [error]: ContextOf<'error'>) {
    this.logger.error(error.message, error.stack);
  }
}
