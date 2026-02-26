import { ApplicationCommandOptionType, AutocompleteInteraction, CommandInteraction, Message } from 'discord.js';
import {
  Discord,
  SimpleCommand,
  SimpleCommandMessage,
  SimpleCommandOption,
  SimpleCommandOptionType,
  Slash,
  SlashOption,
} from 'discordx';
import { CurrencyExchangeEmbed } from '../../providers/embeds/commonEmbed.js';
import { currencies } from '../../resources/json/currencies.js';
import { exchangeCurrency } from '../../services/common.js';
import { editOrReplyThenDelete } from '../../utils/index.js';

@Discord()
class CurrencyExchange {
  @SimpleCommand({ aliases: ['ce', 'curr'], description: 'Currency exchange' })
  async currencyExchangeCommand(
    @SimpleCommandOption({
      description: 'From currency',
      name: 'from',
      type: SimpleCommandOptionType.String,
    })
    from: string,
    @SimpleCommandOption({
      description: 'To currency',
      name: 'to',
      type: SimpleCommandOptionType.String,
    })
    to: string,
    @SimpleCommandOption({
      description: 'Amount',
      name: 'amount',
      type: SimpleCommandOptionType.Number,
    })
    amount: number,
    command: SimpleCommandMessage,
  ): Promise<Promise<Message<boolean> | void> | undefined> {
    if (!from || !to || !amount)
      return editOrReplyThenDelete(command.message, { content: '❌ Invalid arguments', ephemeral: true });

    from = from.toUpperCase();
    to = to.toUpperCase();

    const fromCurrency = currencies[from];
    const toCurrency = currencies[to];

    if (!fromCurrency || !toCurrency)
      return editOrReplyThenDelete(command.message, { content: '❌ Invalid currency', ephemeral: true });

    const query = { from, to, amount };
    const result = await exchangeCurrency(query);

    return command.message.reply({
      embeds: [CurrencyExchangeEmbed(result)],
    });
  }

  @Slash({ description: 'Currency exchange', name: 'currency-exchange' })
  async currencyExchangeSlash(
    @SlashOption({
      autocomplete: true,
      description: 'From currency',
      name: 'from',
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    from: string,
    @SlashOption({
      autocomplete: true,
      description: 'To currency',
      name: 'to',
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    to: string,
    @SlashOption({
      description: 'Amount or Expression',
      name: 'amount',
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    amount: string,
    interaction: CommandInteraction | AutocompleteInteraction,
  ): Promise<any> {
    if (interaction.isAutocomplete()) {
      const focusedValue = interaction.options.getFocused();
      interaction.respond(
        Object.entries(currencies)
          .filter(
            ([key, value]: [string, string]) =>
              key.toLowerCase().includes(focusedValue?.toLowerCase()) ||
              value.toLowerCase().includes(focusedValue?.toLowerCase()),
          )
          .map(([key, value]: [string, string]) => Object({ name: value, value: key }))
          .slice(0, 25),
      );
    } else {
      const calculatedAmount: number = eval(amount.toString());
      if (!calculatedAmount || calculatedAmount < 0)
        return editOrReplyThenDelete(interaction, { content: '❌ Invalid amount', ephemeral: true });
      const query = { from: from.toUpperCase(), to: to.toUpperCase(), amount: calculatedAmount };
      const result = await exchangeCurrency(query);

      return interaction.reply({
        embeds: [CurrencyExchangeEmbed(result)],
      });
    }
  }
}
