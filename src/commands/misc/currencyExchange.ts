import { ApplicationCommandOptionType, AutocompleteInteraction, CommandInteraction, Message } from 'discord.js';
import {
  Client,
  Discord,
  SimpleCommand,
  SimpleCommandMessage,
  SimpleCommandOption,
  SimpleCommandOptionType,
  Slash,
  SlashOption,
} from 'discordx';
import { cache } from '../../main.js';
import { CurrencyExchangeEmbed } from '../../providers/embeds/commonEmbed.js';
import { exchangeCurrency } from '../../services/common.js';
import { ICurrency } from '../../types/currencies.js';
import { editOrReplyThenDelete } from '../../utils/index.js';

const currencies: Array<ICurrency> | undefined = cache.get('currencies');

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
    const currencies: Array<ICurrency> | undefined = cache.get('currencies');
    if (!currencies)
      return editOrReplyThenDelete(command.message, { content: '❌ Currencies not cached', ephemeral: true });

    const fromCurrency = currencies.find((currency) => currency.id === from.toUpperCase());
    const toCurrency = currencies.find((currency) => currency.id === to.toUpperCase());

    if (!fromCurrency || !toCurrency)
      return editOrReplyThenDelete(command.message, { content: '❌ Invalid currency', ephemeral: true });

    const result = await exchangeCurrency(fromCurrency.id, toCurrency.id, amount);

    return command.message.reply({
      embeds: [
        {
          fields: [
            {
              name: 'From',
              value: `\`\`\`${amount} ${from.toUpperCase()}\`\`\``,
              inline: true,
            },
            {
              name: 'To',
              value: `\`\`\`${result} ${to.toUpperCase()}\`\`\``,
              inline: true,
            },
          ],
        },
      ],
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
        (cache.get('currencies') as Array<any>)!
          .map((currency) => ({
            name: currency.currencyName,
            value: currency.id,
          }))
          .filter(
            (currency) =>
              currency.name.toLowerCase().includes(focusedValue?.toLowerCase() ?? '') ||
              currency.value.toLowerCase().includes(focusedValue?.toLowerCase() ?? ''),
          )
          .slice(0, 25),
      );
    } else {
      const calculatedAmount: number = eval(amount.toString());
      if (!calculatedAmount || calculatedAmount < 0)
        return editOrReplyThenDelete(interaction, { content: '❌ Invalid amount', ephemeral: true });
      const result = await exchangeCurrency(from.toUpperCase(), to.toUpperCase(), calculatedAmount);
      return interaction.reply({
        embeds: [CurrencyExchangeEmbed(from, to, calculatedAmount, result, interaction.client as Client)],
      });
    }
  }
}
