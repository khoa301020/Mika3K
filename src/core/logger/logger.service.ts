import { Injectable, Logger, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, Channel, TextChannel, EmbedBuilder } from 'discord.js';

@Injectable({ scope: Scope.TRANSIENT })
export class AppLoggerService extends Logger {
  private logChannel: TextChannel | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly client: Client,
  ) {
    super();
  }

  private getLogChannel(): TextChannel | null {
    if (this.logChannel) return this.logChannel;

    const channelId = this.configService.get<string>('LOG_CHANNEL_ID');
    if (!channelId) return null;

    const channel: Channel | undefined =
      this.client.channels.cache.get(channelId);
    if (channel?.isTextBased() && !channel.isDMBased()) {
      this.logChannel = channel as TextChannel;
      return this.logChannel;
    }
    return null;
  }

  errorToDiscord(error: Error, context?: string): void {
    super.error(error.message, error.stack, context);

    if (this.configService.get<string>('BOT_ENV') !== 'production') return;

    const channel = this.getLogChannel();
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setTitle(`❌ Error${context ? ` in ${context}` : ''}`)
      .setDescription(`\`\`\`\n${error.message}\n\`\`\``)
      .setColor(0xff0000)
      .setTimestamp();

    if (error.stack) {
      const truncatedStack =
        error.stack.length > 1024
          ? error.stack.substring(0, 1021) + '...'
          : error.stack;
      embed.addFields({
        name: 'Stack',
        value: `\`\`\`\n${truncatedStack}\n\`\`\``,
      });
    }

    channel.send({ embeds: [embed] }).catch(() => {});
  }
}
