import { Injectable, UseInterceptors } from '@nestjs/common';
import {
  Context,
  Options,
  SlashCommand,
  UserCommand,
  MessageCommand,
  AutocompleteInterceptor,
} from 'necord';
import type {
  SlashCommandContext,
  UserCommandContext,
  MessageCommandContext,
} from 'necord';
import type { GuildMember } from 'discord.js';
import { AutocompleteInteraction, MessageFlags } from 'discord.js';
import { MiscService } from './misc.service';
import { MiscEmbeds } from './misc.embeds';
import { MathDto, CurrencyExchangeDto, CheckInfoDto, SaucenaoDto } from './dto';
import { PaginationService } from '../../shared/pagination';
import { CURRENCIES } from './misc.constants';
import { getRandomInteger, randomArray } from '../../shared/utils';
import { StringOption } from 'necord';

// --- Currency Autocomplete Interceptor ---
@Injectable()
class CurrencyAutocompleteInterceptor extends AutocompleteInterceptor {
  transformOptions(interaction: AutocompleteInteraction) {
    const focused = interaction.options.getFocused(true);
    const query = focused.value.toString().toLowerCase();

    const filtered = Object.entries(CURRENCIES)
      .filter(
        ([k, v]) =>
          k.toLowerCase().includes(query) || v.toLowerCase().includes(query),
      )
      .map(([k, v]) => ({ name: v, value: k }))
      .slice(0, 25);

    void interaction.respond(filtered);
  }
}
class PickDto {
  @StringOption({
    name: 'options',
    description: 'Comma-separated options (or range like 1-10)',
    required: true,
  })
  options: string;
}

@Injectable()
export class MiscCommands {
  constructor(
    private readonly miscService: MiscService,
    private readonly miscEmbeds: MiscEmbeds,
    private readonly paginationService: PaginationService,
  ) {}

  // --- Math ---

  @SlashCommand({ name: 'math', description: 'Calculate a math expression' })
  async math(
    @Context() [interaction]: SlashCommandContext,
    @Options() dto: MathDto,
  ) {
    const result = await this.miscService.calculateMath(dto.expression);
    if (result === null) {
      return interaction.reply({
        content: '❌ Invalid expression',
        flags: [MessageFlags.Ephemeral],
      });
    }
    return interaction.reply({
      embeds: [this.miscEmbeds.math(dto.expression, result.toString())],
      flags: [MessageFlags.Ephemeral],
    });
  }

  // --- Currency Exchange ---

  @UseInterceptors(CurrencyAutocompleteInterceptor)
  @SlashCommand({ name: 'currency-exchange', description: 'Currency exchange' })
  async currencyExchange(
    @Context() [interaction]: SlashCommandContext,
    @Options() dto: CurrencyExchangeDto,
  ) {
    const amount = parseFloat(dto.amount);
    if (isNaN(amount) || amount <= 0) {
      return interaction.reply({
        content: '❌ Invalid amount',
        flags: [MessageFlags.Ephemeral],
      });
    }

    const from = dto.from.toUpperCase();
    const to = dto.to.toUpperCase();

    if (!CURRENCIES[from] || !CURRENCIES[to]) {
      return interaction.reply({
        content: '❌ Invalid currency',
        flags: [MessageFlags.Ephemeral],
      });
    }

    try {
      const result = await this.miscService.exchangeCurrency({
        from,
        to,
        amount,
      });
      return interaction.reply({
        embeds: [this.miscEmbeds.currencyExchange(result)],
      });
    } catch {
      return interaction.reply({
        content: '❌ Exchange failed',
        flags: [MessageFlags.Ephemeral],
      });
    }
  }

  // --- Check Info ---

  @SlashCommand({ name: 'check-info', description: 'Check user info' })
  async checkInfo(
    @Context() [interaction]: SlashCommandContext,
    @Options() dto: CheckInfoDto,
  ) {
    const targetUser = dto.user ?? interaction.user;
    const member = await interaction.guild!.members
      .fetch(targetUser.id)
      .catch(() => null);
    if (!member)
      return interaction.reply({
        content: '❌ Invalid user',
        flags: [MessageFlags.Ephemeral],
      });

    return interaction.reply({
      embeds: [this.miscEmbeds.userInfo(interaction.user, member)],
      flags: [MessageFlags.Ephemeral],
    });
  }

  @UserCommand({ name: 'Check user info' })
  async checkInfoContext(@Context() [interaction]: UserCommandContext) {
    const member = interaction.guild!.members.cache.get(interaction.targetId);
    if (!member)
      return interaction.reply({
        content: '❌ User not found',
        flags: [MessageFlags.Ephemeral],
      });

    return interaction.reply({
      embeds: [this.miscEmbeds.userInfo(interaction.user, member)],
      flags: [MessageFlags.Ephemeral],
    });
  }

  // --- Pick ---

  @SlashCommand({ name: 'pick', description: 'Pick random option(s)' })
  async pick(
    @Context() [interaction]: SlashCommandContext,
    @Options() dto: PickDto,
  ) {
    const options = dto.options.split(',').filter((x) => x.trim());
    const range = options
      .map((x) => x.match(/(-?\d+)\s*-\s*(-?\d+)/))
      .filter((x) => x);

    let result: string[];

    if (range.length > 0) {
      result = range
        .filter((x) => x && x.length === 3)
        .map((x) => {
          let start = parseInt(x![1]);
          let end = parseInt(x![2]);
          if (start > end) [start, end] = [end, start];
          return `${getRandomInteger(start, end)}`;
        });
    } else {
      if (options.length < 2) {
        return interaction.reply({
          content: '❌ Please provide at least 2 options',
          flags: [MessageFlags.Ephemeral],
        });
      }
      result = randomArray(options, 1).map((r) => r.trim());
    }

    return interaction.reply(
      `I pick ${new Intl.ListFormat('en-GB').format(result.map((r) => `**${r.trim()}**`))}`,
    );
  }

  // --- SauceNAO ---

  @SlashCommand({ name: 'saucenao', description: 'SauceNAO image search' })
  async saucenao(
    @Context() [interaction]: SlashCommandContext,
    @Options() dto: SaucenaoDto,
  ) {
    if (!dto.url && !dto.attachment) {
      return interaction.reply({
        content: '❌ URL or attachment required.',
        flags: [MessageFlags.Ephemeral],
      });
    }
    if (dto.url && dto.attachment) {
      return interaction.reply({
        content: '❌ Only one of URL or attachment.',
        flags: [MessageFlags.Ephemeral],
      });
    }

    await interaction.deferReply({
      flags: !dto.isPublic ? [MessageFlags.Ephemeral] : [],
    });

    const imageUrl = dto.url ?? dto.attachment?.url;
    const data = await this.miscService.searchSaucenao(imageUrl);

    if (data.header?.status !== 0) {
      return interaction.editReply({
        content: `❌ ${data.header?.message ?? 'Search failed'}`,
      });
    }

    const results = this.miscService.filterSaucenaoResults(data);
    if (!results) {
      return interaction.editReply({
        content: '❌ No results found or similarity too low.',
      });
    }

    if (results.length === 1) {
      return interaction.editReply({
        embeds: [this.miscEmbeds.saucenaoResult(interaction.user, results[0])],
      });
    }

    const pages = results.map((result, i) => ({
      embeds: [
        this.miscEmbeds.saucenaoResult(
          interaction.user,
          result,
          i + 1,
          results.length,
        ),
      ],
    }));

    return this.paginationService.paginate(interaction, pages, {
      ephemeral: !dto.isPublic,
    });
  }

  @MessageCommand({ name: 'Search SauceNAO' })
  async saucenaoContext(@Context() [interaction]: MessageCommandContext) {
    await interaction.deferReply();

    const message = interaction.targetMessage;
    let imageUrl = message.content;
    const attachments = message.attachments.map((a) => a.url);
    if (attachments.length > 0) imageUrl = attachments[0];

    if (!imageUrl) {
      return interaction.editReply({
        content: '❌ No image found in message.',
      });
    }

    const data = await this.miscService.searchSaucenao(imageUrl);

    if (data.header?.status !== 0) {
      return interaction.editReply({
        content: `❌ ${data.header?.message ?? 'Search failed'}`,
      });
    }

    const results = this.miscService.filterSaucenaoResults(data);
    if (!results) {
      return interaction.editReply({
        content: '❌ No results found or similarity too low.',
      });
    }

    if (results.length === 1) {
      return interaction.editReply({
        embeds: [this.miscEmbeds.saucenaoResult(interaction.user, results[0])],
      });
    }

    const pages = results.map((result, i) => ({
      embeds: [
        this.miscEmbeds.saucenaoResult(
          interaction.user,
          result,
          i + 1,
          results.length,
        ),
      ],
    }));

    return this.paginationService.paginate(interaction, pages, {
      ephemeral: false,
    });
  }

  @SlashCommand({ name: 'help', description: 'List all available commands' })
  public async help(@Context() [interaction]: SlashCommandContext) {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    const commands = interaction.client.application?.commands.cache;
    if (!commands || commands.size === 0) {
      // Fetch from API if cache is empty
      await interaction.client.application?.commands.fetch();
    }

    const allCommands = interaction.client.application?.commands.cache;
    if (!allCommands || allCommands.size === 0) {
      return interaction.editReply({ content: 'No commands found.' });
    }

    const commandList = allCommands
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((cmd) => `\`/${cmd.name}\` — ${cmd.description}`)
      .join('\n');

    const embed = new (await import('discord.js')).EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('📖 Available Commands')
      .setDescription(commandList.slice(0, 4096))
      .setTimestamp()
      .setFooter({
        text: `${interaction.client.user?.displayName || 'Mika3K'} • ${allCommands.size} commands`,
        iconURL: interaction.client.user?.displayAvatarURL(),
      });

    return interaction.editReply({ embeds: [embed] });
  }
}
