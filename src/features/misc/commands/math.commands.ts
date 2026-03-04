import { Injectable } from '@nestjs/common';
import { MessageFlags } from 'discord.js';
import type { SlashCommandContext, TextCommandContext } from 'necord';
import { Arguments, Context, Options, SlashCommand, TextCommand } from 'necord';
import { MathDto } from '../dto';
import { MiscEmbeds } from '../misc.embeds';
import { MiscService } from '../misc.service';

@Injectable()
export class MathCommands {
  constructor(
    private readonly miscService: MiscService,
    private readonly miscEmbeds: MiscEmbeds,
  ) {}

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

  @TextCommand({
    name: 'math',
    description: 'Math calculate',
    // aliases: ['m'],
  })
  async onMathText(
    @Context() [message]: TextCommandContext,
    @Arguments() args: string[],
  ) {
    const expression = args.join(' ').trim();
    if (!expression) return;

    try {
      const result = await this.miscService.calculateMath(expression);
      if (result === null) return message.reply('❌ Invalid expression');

      return message.reply({
        embeds: [this.miscEmbeds.math(expression, result.toString())],
      });
    } catch {
      return message.reply('❌ Invalid expression');
    }
  }
}
