import { Injectable, Logger } from '@nestjs/common';
import { Context, On } from 'necord';
import type { ContextOf } from 'necord';
import { ChannelType, EmbedBuilder, User } from 'discord.js';
import { NHentaiService, INHentai } from './nhentai.service';
import { NotifyChannelService, NotifyType } from '../../shared/notify-channel';

export const NHentaiEmbed = (data: INHentai, author: User): EmbedBuilder => {
  return new EmbedBuilder()
    .setColor(0xed2553)
    .setAuthor({
      name: 'nHentai',
      iconURL:
        'https://cdn.discordapp.com/app-icons/1182582420366835773/0c8de65e94b2aee08e3328ce78cfba15.png?size=256',
    })
    .setTitle(
      data.title.pretty
        ? data.title.pretty
        : data.title.english
          ? data.title.english
          : data.title.japanese,
    )
    .setURL(`https://nhentai.net/g/${data.id}`)
    .setThumbnail(
      `https://t.nhentai.net/galleries/${data.media_id}/cover.${
        data.images.cover.t === 'p'
          ? 'png'
          : data.images.cover.t === 'j'
            ? 'jpg'
            : 'gif'
      }`,
    )
    .addFields(
      {
        name: 'Tags',
        value:
          data.tags
            .filter((tag) => tag.type === 'tag')
            .map((tag) => tag.name)
            .join(', ') || 'none',
      },
      {
        name: 'Parodies',
        value:
          data.tags
            .filter((tag) => tag.type === 'parody')
            .map((tag) => tag.name)
            .join(', ') || 'none',
        inline: true,
      },
      {
        name: 'Characters',
        value:
          data.tags
            .filter((tag) => tag.type === 'character')
            .map((tag) => tag.name)
            .join(', ') || 'none',
        inline: true,
      },
      {
        name: 'Artists',
        value:
          data.tags
            .filter((tag) => tag.type === 'artist')
            .map((tag) => tag.name)
            .join(', ') || 'none',
        inline: true,
      },
      {
        name: 'Pages',
        value: data.num_pages.toString(),
        inline: true,
      },
      {
        name: 'Favorites',
        value: data.num_favorites.toString(),
        inline: true,
      },
      {
        name: 'Languages',
        value:
          data.tags
            .filter((tag) => tag.type === 'language')
            .map((tag) => tag.name)
            .join(', ') || 'none',
        inline: true,
      },
    )
    .setFooter({
      text: `${author.username}#${author.discriminator}`,
      iconURL: author.displayAvatarURL(),
    })
    .setTimestamp(data.upload_date * 1000);
};

@Injectable()
export class NHentaiEvents {
  private readonly logger = new Logger(NHentaiEvents.name);

  constructor(
    private readonly nhentaiService: NHentaiService,
    private readonly notifyChannelService: NotifyChannelService,
  ) {}

  @On('messageCreate')
  public async onMessageCreate(
    @Context() [message]: ContextOf<'messageCreate'>,
  ) {
    if (message.author.bot) return;
    if (message.channel.type !== ChannelType.GuildText) return;
    if (!message.channel.nsfw) return;

    // Only auto-view in channels that have been explicitly enabled
    const isEnabled = await this.notifyChannelService.isChannelEnabled(
      message.channelId,
      NotifyType.NHENTAI_AUTOVIEW,
    );
    if (!isEnabled) return;
    if (
      process.env.BOT_PREFIX &&
      message.content.startsWith(process.env.BOT_PREFIX)
    )
      return;

    let codes: Array<string> | null = message.content
      .replace(/<a?:.+?:\d+>/g, '') // remove emojis
      .replace(/<@!?\d+>/g, '') // remove mentions
      .replace(/https?:\/\/\S+/g, '') // remove links
      .match(/(?<!\d)\d{6}(?!\d)/g);

    if (!codes || codes.length === 0) return;

    codes = [...new Set(codes)].slice(0, 3); // limit to 3 embeds per message (CommonConstants.EMBED_LIMIT_PER_MESSAGE was typically 3)

    const results: Array<INHentai> = [];
    try {
      if ('sendTyping' in message.channel) await message.channel.sendTyping();

      for (const code of codes) {
        const data = await this.nhentaiService.getGallery(code);
        if (data) results.push(data);
        await new Promise((resolve) => setTimeout(resolve, 3333));
      }
    } catch (err: any) {
      this.logger.error('Failed to autoview nHentai codes', err);
      await message.react('❌').catch(() => {});
      return;
    }

    if (results.length === 0) {
      await message.react('❌').catch(() => {});
      return;
    }

    const embeds = results.map((result) =>
      NHentaiEmbed(result, message.author),
    );

    await message
      .reply({
        embeds: [...embeds],
        allowedMentions: { repliedUser: false },
      })
      .catch((err) => this.logger.error('Could not send nHentai embeds', err));
  }
}
