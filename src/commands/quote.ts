import { Message } from 'discord.js';
import { Discord, SimpleCommand, SimpleCommandMessage, SimpleCommandOption, SimpleCommandOptionType } from 'discordx';
import { randomArray } from '../helpers/helper.js';
import { createQuote, getQuote } from '../services/quote.js';
import { IUserQuote } from '../types/quote.js';

@Discord()
class Quote {
  @SimpleCommand({ aliases: ['$', 'addquote'], description: 'Create new quote', argSplitter: ' ' })
  async createQuoteCommand(
    @SimpleCommandOption({ name: 'command', type: SimpleCommandOptionType.String })
    cmd: string,
    @SimpleCommandOption({ name: 'key', type: SimpleCommandOptionType.String })
    key: string,
    command: SimpleCommandMessage,
  ): Promise<Message<boolean>> {
    if (!key) return command.message.reply('Keyword required.');

    const value = command.message.content.split(' ').slice(2).join(' ').trim();
    const attachments = command.message.attachments.map((a) => a.url).join(', ');

    if (!value && !attachments) return command.message.reply('Content required.');

    const quote: IUserQuote = {
      guild: command.message.guildId!,
      user: command.message.author.id,
      quote: {
        key: key,
        value: `${value} ${attachments}`.trim(),
      },
      createdAt: new Date(),
    };

    try {
      createQuote(quote).then((quoteResponse) => {
        if (!quoteResponse) return command.message.reply('Error occured.');
      });
    } catch (error) {
      return command.message.reply('Error occured.');
    }

    return command.message.reply('Quote added successfully.');
  }

  @SimpleCommand({ aliases: ['$$', 'getquote'], description: 'Create new quote', argSplitter: ' ' })
  async getQuoteCommand(
    @SimpleCommandOption({ name: 'command', type: SimpleCommandOptionType.String })
    cmd: string,
    @SimpleCommandOption({ name: 'key', type: SimpleCommandOptionType.String })
    key: string,
    command: SimpleCommandMessage,
  ): Promise<Message<boolean>> {
    if (!key) return command.message.reply('Keyword required.');
    const keyword = key.trim();
    const guildId = command.message.guildId;
    let quotes: IUserQuote[] = await getQuote(keyword, guildId!);

    if (quotes.length === 0) return command.message.reply('No quote found.');

    return command.message.reply({ content: randomArray(quotes).quote?.value });
  }
}
