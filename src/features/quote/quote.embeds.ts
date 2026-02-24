import { Injectable } from '@nestjs/common';
import { EmbedBuilder, User, Client } from 'discord.js';
import { DEFAULT_EMBED_COLOR, EmbedService } from '../../shared/embed';

@Injectable()
export class QuoteEmbeds {
  constructor(
    private readonly embedService: EmbedService,
    private readonly client: Client,
  ) {}

  listQuotes(
    author: User,
    quotes: any[],
    page: number,
    total: number,
  ): EmbedBuilder {
    const list = quotes.map((quote) => ({
      id: quote._id,
      author: quote.user,
      keyword: quote.quote?.key,
      hits: quote.hits
        ? Object.entries(quote.hits).reduce(
            (acc, [, value]) => acc + (value as number),
            0,
          )
        : 0,
    }));

    return new EmbedBuilder()
      .setColor(DEFAULT_EMBED_COLOR)
      .setTitle(`Server quotes list, page ${page}`)
      .setAuthor({
        name: author.username,
        iconURL: author.displayAvatarURL(),
      })
      .setDescription(
        list
          .map(
            (q) =>
              `\`${q.id}\` **${q.keyword.toUpperCase()}** (${q.hits}) by <@${q.author}>`,
          )
          .join('\n'),
      )
      .setTimestamp()
      .setFooter({
        text: `${this.client.user?.displayName} (${page}/${total})`,
        iconURL: this.client.user!.displayAvatarURL(),
      });
  }
}
