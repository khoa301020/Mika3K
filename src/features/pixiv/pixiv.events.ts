import { Injectable, Logger } from '@nestjs/common';
import { Context, On } from 'necord';
import type { ContextOf } from 'necord';
import { ChannelType, Client } from 'discord.js';
import { AppHttpService } from '../../shared/http';
import { PixivConstants } from './pixiv.constants';
import { PixivIllustListEmbeds } from './pixiv.embeds';
import type { IPixivIllustResponse } from './types';

@Injectable()
export class PixivEvents {
  private readonly logger = new Logger(PixivEvents.name);

  constructor(
    private readonly httpService: AppHttpService,
    private readonly client: Client,
  ) {}

  @On('messageCreate')
  public async onPixivMessage(
    @Context() [message]: ContextOf<'messageCreate'>,
  ) {
    if (message.author.bot) return;
    if (
      message.channel.type !== ChannelType.GuildText &&
      message.channel.type !== ChannelType.PublicThread
    )
      return;

    const match = message.content.match(PixivConstants.PIXIV_ILLUST_URL_REGEX);
    if (!match) return;

    const illustId = match[1];
    if (!illustId) return;

    try {
      if ('sendTyping' in message.channel) await message.channel.sendTyping();

      const response = await this.httpService.get(
        PixivConstants.HIBIAPI_ILLUST_API(illustId),
      );

      const illustRes: IPixivIllustResponse =
        response.data as IPixivIllustResponse;
      if (!illustRes || !illustRes.illust) return;

      // NSFW check
      if (
        message.channel.type === ChannelType.GuildText &&
        !message.channel.nsfw &&
        illustRes.illust.x_restrict !== PixivConstants.PIXIV_SAFE_VALUE
      ) {
        const reply = await message.reply({
          content:
            '❌ This illust is NSFW, preview is only available in NSFW channels.',
          allowedMentions: { repliedUser: false },
        });
        setTimeout(() => {
          void reply.delete().catch(() => {});
        }, 5000);
        return;
      }

      await message.suppressEmbeds(true).catch(() => {});

      await message.reply({
        embeds: [...PixivIllustListEmbeds(illustRes.illust, this.client)],
        allowedMentions: { repliedUser: false },
      });
    } catch (err) {
      this.logger.error('Pixiv embed error', err);
    }
  }
}
