import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { Client, TextChannel, EmbedBuilder } from 'discord.js';
import type { ErrorPayload } from './database-logger.listener';

@Injectable()
export class DiscordLoggerListener {
  constructor(
    private readonly client: Client,
    private readonly configService: ConfigService,
  ) {}

  @OnEvent('log.error', { async: true })
  async handleGlobalError(payload: ErrorPayload) {
    if (this.configService.get<string>('BOT_ENV') !== 'production') return;

    try {
      const channelId = this.configService.get<string>('LOG_CHANNEL_ID');
      if (!channelId) return;

      const channel = this.client.channels.cache.get(channelId);
      if (!channel || !channel.isTextBased() || channel.isDMBased()) return;

      const embed = new EmbedBuilder()
        .setTitle(`❌ Error${payload.context ? ` in ${payload.context}` : ''}`)
        .setDescription(`\`\`\`\n${payload.message.substring(0, 4000)}\n\`\`\``)
        .setColor(0xff0000)
        .setTimestamp();

      if (payload.stack) {
        const truncatedStack =
          payload.stack.length > 1024
            ? payload.stack.substring(0, 1021) + '...'
            : payload.stack;
        embed.addFields({
          name: 'Stack',
          value: `\`\`\`\n${truncatedStack}\n\`\`\``,
        });
      }

      await (channel as TextChannel).send({ embeds: [embed] });
    } catch (e) {
      console.error('Failed to send error to Discord', e);
    }
  }
}
