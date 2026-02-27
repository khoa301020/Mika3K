import { Injectable } from '@nestjs/common';
import { EmbedBuilder, User } from 'discord.js';
import { SyosetuConstants } from './syosetu.constants';
import { ISyosetuGeneralFields } from './types';

export function syosetuFooter(page?: number, total?: number) {
  return {
    text: `Syosetu${page != null && total != null ? ` (${page}/${total})` : ''}`,
    iconURL: SyosetuConstants.SYOSETU_LOGO,
  };
}

@Injectable()
export class SyosetuEmbeds {
  novel(
    novel: ISyosetuGeneralFields & { end?: number },
    author: User,
    page?: number,
    total?: number,
  ): EmbedBuilder {
    let description = novel.story || 'No description available.';
    if (description.length > 1500) {
      description = description.substring(0, 1500) + '...';
    }

    const bg = SyosetuConstants.BIG_GENRES[novel.biggenre];
    const g = SyosetuConstants.GENRES[novel.genre];
    const genreStr = g
      ? `${g.en} / ${g.jp}`
      : bg
        ? `${bg.en} / ${bg.jp}`
        : 'Unknown';

    const embed = new EmbedBuilder()
      .setColor(0x2b58a1)
      .setTitle(
        (novel.title || novel.ncode).length > 256
          ? (novel.title || novel.ncode).substring(0, 253) + '...'
          : novel.title || novel.ncode,
      )
      .setURL(`${SyosetuConstants.NCODE_NOVEL_BASE_URL}${novel.ncode}`)
      .setAuthor({ name: author.username, iconURL: author.displayAvatarURL() })
      .setDescription(description)
      .addFields(
        { name: 'Author', value: novel.writer || 'Unknown', inline: true },
        { name: 'NCode', value: novel.ncode, inline: true },
        {
          name: 'Status',
          value: novel.end === 0 ? 'Completed' : 'Ongoing',
          inline: true,
        },
        { name: 'Genre', value: genreStr, inline: true },
        {
          name: 'Characters',
          value: `${(novel.length || 0).toLocaleString()}`,
          inline: true,
        },
        {
          name: 'Read Time',
          value: `${(novel.time || 0).toLocaleString()} min`,
          inline: true,
        },
      )
      .setFooter(syosetuFooter(page, total));

    try {
      if (novel.general_firstup) {
        embed.addFields({
          name: 'First Upload',
          value: novel.general_firstup,
          inline: true,
        });
      }
      if (novel.general_lastup) {
        embed.addFields({
          name: 'Last Upload',
          value: novel.general_lastup,
          inline: true,
        });
      }
      if (novel.novelupdated_at) {
        embed.setTimestamp(new Date(novel.novelupdated_at));
      }
    } catch {
      // ignore date parsing errors
    }

    return embed;
  }

  genres(author: User): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setColor(0x2b58a1)
      .setTitle('Syosetu Genres')
      .setAuthor({ name: author.username, iconURL: author.displayAvatarURL() })
      .setFooter({
        text: 'Syosetu',
        iconURL: SyosetuConstants.SYOSETU_LOGO,
      });

    const bgList = Object.entries(SyosetuConstants.BIG_GENRES)
      .map(([id, g]) => `\`${id.padEnd(2, ' ')}\` - ${g.en} (${g.jp})`)
      .join('\n');

    const gList = Object.entries(SyosetuConstants.GENRES)
      .map(([id, g]) => `\`${id.padEnd(4, ' ')}\` - ${g.en}`)
      .join('\n');

    embed.addFields(
      { name: 'Big Genres', value: bgList },
      { name: 'Genres', value: gList },
    );

    return embed;
  }
}
