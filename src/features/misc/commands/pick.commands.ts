import { Injectable } from '@nestjs/common';
import { MessageFlags } from 'discord.js';
import type { SlashCommandContext, TextCommandContext } from 'necord';
import { Arguments, Context, Options, SlashCommand, StringOption, TextCommand } from 'necord';
import { getRandomInteger, randomArray } from '../../../shared/utils';

class PickDto {
  @StringOption({
    name: 'options',
    description: 'Comma-separated options (or range like 1-10)',
    required: true,
  })
  options: string;
}

@Injectable()
export class PickCommands {
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

  @TextCommand({
    name: 'pick',
    description: 'Pick random option(s)',
    // aliases: ['p'],
  })
  async onPickText(
    @Context() [message]: TextCommandContext,
    @Arguments() args: string[],
  ) {
    const rawInput = args.join(' ');
    const match = rawInput.match(/(\d+\s+)?(.+)/);
    const amount = match?.[1] ? parseInt(match[1]) : 1;
    const options = match?.[2]
      ? match[2].split(',').filter((x) => x.trim())
      : [];
    const range = options
      .map((x) => x.match(/(-?\d+)\s*-\s*(-?\d+)/))
      .filter((x) => x);

    if (amount < 1 || amount > options.length) {
      return message.reply('❌ Invalid arguments');
    }
    if (options.length < 2 && range.length === 0) {
      return message.reply('❌ Please provide at least 2 options');
    }

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
      result = randomArray(options, amount);
    }

    return message.reply(
      `I pick ${new Intl.ListFormat('en-GB').format(result.map((r) => `**${r.trim()}**`))}`,
    );
  }
}
