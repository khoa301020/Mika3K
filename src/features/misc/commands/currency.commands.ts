import { Injectable, UseInterceptors } from '@nestjs/common';
import { AutocompleteInteraction, MessageFlags } from 'discord.js';
import type { SlashCommandContext, TextCommandContext } from 'necord';
import {
    Arguments,
    AutocompleteInterceptor,
    Context,
    Options,
    SlashCommand,
    TextCommand,
} from 'necord';
import { CurrencyExchangeDto } from '../dto';
import { CURRENCIES } from '../misc.constants';
import { MiscEmbeds } from '../misc.embeds';
import { MiscService } from '../misc.service';

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

@Injectable()
export class CurrencyCommands {
  constructor(
    private readonly miscService: MiscService,
    private readonly miscEmbeds: MiscEmbeds,
  ) {}

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

  @TextCommand({
    name: 'currencyexchange',
    description: 'Currency exchange',
    // aliases: ['ce', 'curr'],
  })
  async onCurrencyExchangeText(
    @Context() [message]: TextCommandContext,
    @Arguments() args: string[],
  ) {
    const [from, to, amountStr] = args;
    if (!from || !to || !amountStr) {
      return message.reply('❌ Usage: `currencyexchange <from> <to> <amount>`');
    }

    const fromUpper = from.toUpperCase();
    const toUpper = to.toUpperCase();
    const amount = parseFloat(amountStr);

    if (!CURRENCIES[fromUpper] || !CURRENCIES[toUpper]) {
      return message.reply('❌ Invalid currency');
    }
    if (isNaN(amount) || amount <= 0) {
      return message.reply('❌ Invalid amount');
    }

    try {
      const result = await this.miscService.exchangeCurrency({
        from: fromUpper,
        to: toUpper,
        amount,
      });
      return message.reply({
        embeds: [this.miscEmbeds.currencyExchange(result)],
      });
    } catch {
      return message.reply('❌ Exchange failed');
    }
  }
}
