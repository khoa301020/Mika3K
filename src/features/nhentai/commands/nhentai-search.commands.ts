import { NHentaiCommandDecorator } from './decorators';
import { Injectable, Logger } from '@nestjs/common';
import { MessageFlags, TextChannel } from 'discord.js';
import type { MessageCommandContext, SlashCommandContext, TextCommandContext } from 'necord';
import {
    Arguments,
    Context,
    MessageCommand,
    Options,
    Subcommand,
    StringOption,
    TextCommand,
} from 'necord';
import { PaginationService } from '../../../shared/pagination';
import { NHentaiEmbed } from '../nhentai.events';
import type { INHentai } from '../nhentai.service';
import { NHentaiService } from '../nhentai.service';

class NHentaiSearchDto {
  @StringOption({ name: 'query', description: 'Search query or 6-digit code', required: true })
  query: string;
}

class NHentaiCheckDto {
  @StringOption({ name: 'code', description: 'nHentai code to check', required: true })
  code: string;
}

@Injectable()
@NHentaiCommandDecorator()
export class NHentaiSearchCommands {
  private readonly logger = new Logger(NHentaiSearchCommands.name);

  constructor(
    private readonly nhentaiService: NHentaiService,
    private readonly paginationService: PaginationService,
  ) {}

  // --- Slash: Search ---

  @Subcommand({ name: 'nh-search', description: 'Search nHentai galleries' })
  public async searchNHentaiSlash(
    @Context() [interaction]: SlashCommandContext,
    @Options() dto: NHentaiSearchDto,
  ) {
    if (
      !interaction.channel?.isTextBased() ||
      !('nsfw' in interaction.channel) ||
      !interaction.channel.nsfw
    ) {
      return interaction.reply({
        content: '❌ This command is only available in NSFW channels.',
        flags: [MessageFlags.Ephemeral],
      });
    }

    await interaction.deferReply();
    return this.processNHentaiSearch(interaction, dto.query, false);
  }

  // --- Slash: Check ---

  @Subcommand({ name: 'nh-check', description: 'Check if an nHentai code is valid' })
  public async checkNHentaiSlash(
    @Context() [interaction]: SlashCommandContext,
    @Options() dto: NHentaiCheckDto,
  ) {
    if (
      !interaction.channel?.isTextBased() ||
      !('nsfw' in interaction.channel) ||
      !interaction.channel.nsfw
    ) {
      return interaction.reply({
        content: '❌ This command is only available in NSFW channels.',
        flags: [MessageFlags.Ephemeral],
      });
    }

    await interaction.deferReply();
    try {
      const data = await this.nhentaiService.getGallery(dto.code);
      if (!data) return interaction.editReply({ content: '❌ Nuked or not found.' });
      return interaction.editReply({ embeds: [NHentaiEmbed(data, interaction.user)] });
    } catch {
      return interaction.editReply({ content: '❌ Error occurred while checking.' });
    }
  }

  // --- Slash: Random ---

  @Subcommand({ name: 'nh-random', description: 'Get a random nHentai gallery' })
  public async randomNHentaiSlash(
    @Context() [interaction]: SlashCommandContext,
  ) {
    if (
      !interaction.channel?.isTextBased() ||
      !('nsfw' in interaction.channel) ||
      !interaction.channel.nsfw
    ) {
      return interaction.reply({
        content: '❌ This command is only available in NSFW channels.',
        flags: [MessageFlags.Ephemeral],
      });
    }

    await interaction.deferReply();

    for (let i = 0; i < 5; i++) {
      const randomId = Math.floor(Math.random() * 500000) + 1;
      try {
        const data = await this.nhentaiService.getGallery(randomId);
        if (data) {
          return interaction.editReply({ embeds: [NHentaiEmbed(data, interaction.user)] });
        }
      } catch {
        // Ignore and retry
      }
    }
    return interaction.editReply({ content: '❌ Could not find a random gallery after several attempts.' });
  }

  // --- Context Menu: Search NHentai ---

  @MessageCommand({ name: 'Search NHentai' })
  public async searchNHentaiContext(
    @Context() [interaction]: MessageCommandContext,
  ) {
    if (
      !interaction.channel?.isTextBased() ||
      !('nsfw' in interaction.channel) ||
      !interaction.channel.nsfw
    ) {
      return interaction.reply({
        content: '❌ This command is only available in NSFW channels.',
        flags: [MessageFlags.Ephemeral],
      });
    }

    await interaction.deferReply();
    const message = interaction.targetMessage;

    const query =
      `${message.content} ${message.embeds.length > 0 ? message.embeds.map((e) => e.title || '').join(' ') : ''}`
        .replace(/<a?:.+?:\d+>/g, '')
        .replace(/<@!?\d+>/g, '')
        .replace(/https?:\/\/\S+/g, '')
        .trim();

    if (!query) {
      return interaction.editReply({ content: '❌ Text required to search.' });
    }
    return this.processNHentaiSearch(interaction, query, false);
  }

  // --- Text: Check/Search (auto-detects codes) ---

  @TextCommand({
    name: 'nhentai',
    description: 'Check nHentai code(s)',
    // aliases: ['nh'],
  })
  async onNhentaiText(
    @Context() [message]: TextCommandContext,
    @Arguments() args: string[],
  ) {
    const code = args[0];
    if (!code) {
      return message.reply(
        '❌ Please provide code(s), separated by space and must be 6 digits if more than 1',
      );
    }
    if (!(message.channel as TextChannel).nsfw) {
      return message.reply('❌ This command can only be used in NSFW channel');
    }

    const content = message.content
      .replace(/<a?:.+?:\d+>/g, '')
      .replace(/<@!?\d+>/g, '')
      .replace(/https?:\/\/\S+/g, '');

    const codes: string[] | null = content.match(/(?<!\d)\d{6}(?!\d)/g);
    if (!codes) return message.reply('❌ No code found in the message');

    try {
      const results: INHentai[] = [];
      for (const c of codes) {
        const data = await this.nhentaiService.getGallery(c);
        if (data) results.push(data);
        if (codes.length > 1) {
          await new Promise((r) => setTimeout(r, 3333));
        }
      }

      if (results.length === 0) return message.reply('❌ No code found');

      if (results.length === 1) {
        return message.reply({
          embeds: [NHentaiEmbed(results[0], message.author)],
        });
      }

      const embeds = results.slice(0, 10).map((book, index) =>
        NHentaiEmbed(book, message.author, index + 1, results.length),
      );
      return message.reply({ embeds });
    } catch (err: any) {
      return message.reply(`❌ ${err.message || 'Error occurred'}`);
    }
  }

  // --- Text: Search ---

  @TextCommand({
    name: 'nhsearch',
    description: 'Search nHentai',
    // aliases: ['nhs'],
  })
  async onNhSearchText(
    @Context() [message]: TextCommandContext,
    @Arguments() args: string[],
  ) {
    if (!(message.channel as TextChannel).nsfw) {
      return message.reply('❌ This command can only be used in NSFW channel');
    }

    const rawInput = args.join(' ');
    let [query, sort, page] = rawInput
      ? rawInput.split('|').map((e) => e.trim())
      : ['+', 'popular', '1'];

    query = (query || '+')
      .replace(/<a?:.+?:\d+>/g, '')
      .replace(/<@!?\d+>/g, '')
      .replace(/https?:\/\/\S+/g, '');

    const codes = query.match(/(?<!\d)\d{6}(?!\d)/g);
    if (codes && codes.length > 0) {
      return this.onNhentaiText(
        [message] as unknown as TextCommandContext,
        args,
      );
    }

    try {
      const data = await this.nhentaiService.searchGallery(
        query,
        sort || 'popular',
        parseInt(page) || 1,
      );
      if (!data || data.result.length === 0) {
        return message.reply('❌ No result found');
      }

      const embeds = data.result.slice(0, 10).map((book, index) =>
        NHentaiEmbed(book, message.author, index + 1, data.result.length),
      );
      return message.reply({ embeds });
    } catch (err: any) {
      return message.reply(`❌ ${err.message || 'Error occurred'}`);
    }
  }

  // --- Text: Random ---

  @TextCommand({
    name: 'nhrandom',
    description: 'Random nHentai',
    // aliases: ['nhrd'],
  })
  async onNhRandomText(@Context() [message]: TextCommandContext) {
    if (!(message.channel as TextChannel).nsfw) {
      return message.reply('❌ This command can only be used in NSFW channel');
    }

    try {
      for (let i = 0; i < 5; i++) {
        const randomId = Math.floor(Math.random() * 500000) + 1;
        const data = await this.nhentaiService.getGallery(randomId);
        if (data) {
          return message.reply({
            embeds: [NHentaiEmbed(data, message.author)],
          });
        }
      }
      return message.reply('❌ No result found');
    } catch (err: any) {
      return message.reply(`❌ ${err.message || 'Error occurred'}`);
    }
  }

  // --- Shared Search Processor (for slash/context) ---

  private async processNHentaiSearch(interaction: any, query: string, isEphemeral: boolean) {
    try {
      const codes: Array<string> | null = query.match(/(?<!\d)\d{6}(?!\d)/g);

      if (codes && codes.length > 0) {
        const results = [];
        for (const code of codes) {
          const data = await this.nhentaiService.getGallery(code);
          if (!data) continue;
          results.push(data);
          if (codes.length > 1) {
            await new Promise((r) => setTimeout(r, 3333));
          }
        }

        if (results.length === 0)
          return interaction.editReply({ content: '❌ No code found' });

        if (results.length === 1) {
          const embed = NHentaiEmbed(results[0], interaction.user);
          return await interaction.editReply({ embeds: [embed] });
        } else {
          const pages = results.map((book, index) => {
            const embed = NHentaiEmbed(
              book,
              interaction.user,
              index + 1,
              results.length,
            );
            return { embeds: [embed] };
          });
          return await this.paginationService.paginate(interaction, pages, {
            type: 'button',
            ephemeral: isEphemeral,
          });
        }
      } else {
        const data = await this.nhentaiService.searchGallery(query);
        if (!data || data.result.length === 0)
          return interaction.editReply({ content: '❌ No result found' });

        const list = data.result;

        const pages = list.map((book, index) => {
          const bookData = {
            ...book,
            total_search_page: data.num_pages,
            current_search_page: 1,
          };
          const embed = NHentaiEmbed(
            bookData,
            interaction.user,
            index + 1,
            list.length,
          );
          return { embeds: [embed] };
        });

        return await this.paginationService.paginate(interaction, pages, {
          type: 'button',
          ephemeral: isEphemeral,
        });
      }
    } catch (err: any) {
      return interaction.editReply({
        content: err.message || '❌ Error occurred.',
      });
    }
  }
}
