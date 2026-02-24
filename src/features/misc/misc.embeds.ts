import { Injectable } from '@nestjs/common';
import { EmbedBuilder, User, GuildMember, Client } from 'discord.js';
import { DEFAULT_EMBED_COLOR } from '../../shared/embed';
import { datetimeConverter } from '../../shared/utils';
import {
  SAUCENAO_LOGO,
  SAUCENAO_SOURCES,
  NHENTAI_BASE_URL,
} from './misc.constants';
import { MiscService } from './misc.service';
import type { ISaucenaoSearchResult, IExchangeResult } from './misc.types';

@Injectable()
export class MiscEmbeds {
  constructor(
    private readonly client: Client,
    private readonly miscService: MiscService,
  ) {}

  userInfo(author: User, user: GuildMember): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(DEFAULT_EMBED_COLOR)
      .setTitle(user.user.username)
      .setURL(`https://discordapp.com/users/${user.id}`)
      .setAuthor({ name: author.username, iconURL: author.displayAvatarURL() })
      .setDescription(user.nickname ?? 'No nickname')
      .setThumbnail(user.displayAvatarURL() ?? null)
      .addFields(
        { name: 'ID', value: user.id },
        {
          name: 'Roles',
          value:
            user.roles.cache
              .filter((r) => r.name !== '@everyone')
              .map((r) => r.toString())
              .join(', ') || 'None',
        },
        {
          name: 'Created',
          value: datetimeConverter(user.user.createdAt).date,
          inline: true,
        },
        {
          name: 'Joined',
          value: datetimeConverter(user.joinedAt!).date,
          inline: true,
        },
        {
          name: 'Booster since',
          value: user.premiumSince
            ? datetimeConverter(user.premiumSince).date
            : 'No boosting',
        },
      )
      .setTimestamp()
      .setFooter({
        text: this.client.user!.displayName,
        iconURL: this.client.user!.displayAvatarURL(),
      });
  }

  math(expression: string, result: string): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(DEFAULT_EMBED_COLOR)
      .setTitle('Calculated result')
      .addFields(
        { name: 'Expression', value: `\`\`\`${expression}\`\`\`` },
        { name: 'Result', value: `\`\`\`${result}\`\`\`` },
      )
      .setTimestamp()
      .setFooter({
        text: this.client.user!.displayName,
        iconURL: this.client.user!.displayAvatarURL(),
      });
  }

  currencyExchange(res: IExchangeResult): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setColor(DEFAULT_EMBED_COLOR)
      .addFields(
        {
          name: `From ${res.query.from}`,
          value: `\`\`\`${res.query.amount.toLocaleString()}\`\`\``,
        },
        {
          name: `To ${res.query.to}`,
          value: `\`\`\`${res.result.toLocaleString()}\`\`\``,
        },
      )
      .setTimestamp()
      .setFooter({
        text: this.client.user!.displayName,
        iconURL: this.client.user!.displayAvatarURL(),
      });

    if (res.query.amount > 1) {
      embed.setTitle(
        `Rate: 1 ${res.query.from} = ${res.info.rate.toLocaleString()} ${res.query.to}`,
      );
    }

    return embed;
  }

  saucenaoResult(
    author: User,
    result: ISaucenaoSearchResult,
    page?: number,
    total?: number,
  ): EmbedBuilder {
    const isNhentai =
      SAUCENAO_SOURCES[result.header?.index_id ?? 0] === 'NHentai';
    const nukeCode = isNhentai
      ? result.header?.thumbnail?.match(/res\/nhentai\/(\d+)/)?.[1]
      : null;
    const title = nukeCode
      ? `[${nukeCode}] ${result.data?.source ?? 'N/A'}`
      : (result.data?.title ?? 'N/A');
    const url = nukeCode
      ? `${NHENTAI_BASE_URL}/g/${nukeCode}`
      : (result.header?.thumbnail ?? null);

    return new EmbedBuilder()
      .setColor(DEFAULT_EMBED_COLOR)
      .setTitle(
        `[${SAUCENAO_SOURCES[result.header?.index_id ?? 0] ?? 'Unknown'}] ${title} \`${result.header?.similarity}%\``,
      )
      .setURL(url)
      .setAuthor({ name: author.username, iconURL: author.displayAvatarURL() })
      .setDescription(result.header?.index_name ?? '')
      .addFields(this.miscService.resultsToEmbedFields(result.data))
      .setThumbnail(SAUCENAO_LOGO)
      .setImage(result.header?.thumbnail ?? null)
      .setTimestamp()
      .setFooter({
        text: `SauceNAO${page ? ` (${page}/${total})` : ''}`,
        iconURL: SAUCENAO_LOGO,
      });
  }
}
