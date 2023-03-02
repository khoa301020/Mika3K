import axios from 'axios';
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  CommandInteraction,
  MessageActionRowComponentBuilder,
  TextChannel,
} from 'discord.js';
import { ArgsOf, ButtonComponent, Discord, On, Slash, SlashGroup, SlashOption } from 'discordx';
import { CommonConstants, NHentaiConstants } from '../../constants/index.js';
import { NHentaiBookEmbed } from '../../providers/embeds/nhentaiEmbed.js';

@SlashGroup({ description: 'nhentai-commands', name: 'nhentai' })
@Discord()
class GetNHentaiCode {
  @SlashGroup('nhentai')
  @Slash({ description: 'Check NHentai nuke code', name: 'check' })
  async checkCode(
    @SlashOption({
      description: 'NHentai code',
      name: 'code',
      required: true,
      type: ApplicationCommandOptionType.Integer,
    })
    code: String,
    interaction: CommandInteraction,
  ): Promise<void> {
    axios
      .get(`${NHentaiConstants.NHENTAI_API}/get?book=${code}`)
      .then((res) => {
        const embed = NHentaiBookEmbed(res, interaction.user);

        interaction.reply({ embeds: [embed], ephemeral: true });
      })
      .catch((err) => {
        console.log(err);
        interaction.reply({ content: err.message, ephemeral: true });
      });
  }

  @On({ event: 'messageCreate' })
  async onMessage([message]: ArgsOf<'messageCreate'>) {
    if (message.author.bot || !CommonConstants.REGEX_NUM.test(message.content)) return false;
    if (parseInt(message.content) < 0 || parseInt(message.content) > 999999) return false;
    const confirmBtn = new ButtonBuilder().setLabel('	|_・)').setStyle(ButtonStyle.Primary).setCustomId('get-nuke');

    const row = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(confirmBtn);

    message.reply({ content: 'Nuke?', components: [row] }).then((msg) => {
      setTimeout(() => msg.edit({ content: 'Nuke?', components: [] }), 60 * 1000);
    });
  }

  @ButtonComponent({ id: 'get-nuke' })
  async confirmBtn(interaction: ButtonInteraction): Promise<void> {
    const codeMessageId = interaction.message.reference?.messageId!;
    const message = await (interaction.channel as TextChannel)?.messages.fetch(codeMessageId)!;

    axios
      .get(`${NHentaiConstants.NHENTAI_API}/get?book=${message.content}`)
      .then((res) => {
        const embed = NHentaiBookEmbed(res, message.author);
        interaction.reply({ embeds: [embed], ephemeral: true });
      })
      .catch((err) => {
        console.log(err);
        interaction.reply({ content: err.message, ephemeral: true });
      });
  }
}
