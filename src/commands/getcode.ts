import axios from 'axios';
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  CommandInteraction,
  EmbedBuilder,
  MessageActionRowComponentBuilder,
} from 'discord.js';
import { ArgsOf, ButtonComponent, Client, Discord, On, Slash, SlashOption } from 'discordx';

let config = {
  headers: {
    'user-agent':
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
  },
};

@Discord()
class Example {
  @Slash({ description: 'Check NHentai nuke code', name: 'check-nuke' })
  async hello(
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
      .get(`https://janda.mod.land/nhentai/get?book=${code}`, config)
      .then((res) => {
        const book = res.data.data;
        const embed = new EmbedBuilder()
          .setColor(0x0099ff)
          .setTitle(book.title)
          .setURL(res.data.source)
          .setAuthor({
            name: `${interaction.user.username}#${interaction.user.discriminator}`,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setDescription(book.optional_title ? book.optional_title.english : 'No optional names.')
          // .setThumbnail(book.image[0])
          .setThumbnail('https://archive.org/download/nhentai-logo-3/nhentai-logo-3.jpg')
          .addFields(
            { name: 'Parodies', value: book.parodies ? book.parodies : 'original' },
            { name: 'Characters', value: book.characters.length > 0 ? book.characters.join(', ') : 'original' },
            { name: 'Artists', value: book.artist?.join(', ') },
            { name: 'Tags', value: book.tags?.join(', ') },
            // { name: '\u200B', value: '\u200B' },
            { name: 'Favorites', value: book.num_favorites.toString(), inline: true },
            { name: 'Page count', value: book.num_pages.toString(), inline: true },
            { name: 'Language', value: book.language, inline: true },
          )
          .setImage(book.image[0])
          .setTimestamp()
          .addFields({ name: 'Upload date', value: book.upload_date })
          .setFooter({ text: 'NHentai', iconURL: 'https://archive.org/download/nhentai-logo-3/nhentai-logo-3.jpg' });

        interaction.reply({ embeds: [embed], ephemeral: true });
      })
      .catch((err) => {
        console.log(err);
        interaction.reply({ content: err.message, ephemeral: true });
      });
  }

  @On({ event: 'messageCreate' })
  async onMessage(
    [message]: ArgsOf<'messageCreate'>, // Type message automatically
    client: Client, // Client instance injected here,
    guardPayload: any,
  ) {
    if (message.author.bot || !Number.isInteger(parseInt(message.content))) return false;
    if (parseInt(message.content) < 0 || parseInt(message.content) > 999999) return false;
    const confirmBtn = new ButtonBuilder().setLabel('	|_・)').setStyle(ButtonStyle.Primary).setCustomId('get-nuke');

    const row = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(confirmBtn);

    message.reply({ content: 'Nuke?', components: [row] }).then((msg) => {
      confirmBtn.setDisabled(true);
      const newRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(confirmBtn);
      setTimeout(() => msg.edit({ content: 'Nuke?', components: [newRow] }), 60 * 1000);
    });
  }

  @ButtonComponent({ id: 'get-nuke' })
  async confirmBtn(interaction: ButtonInteraction): Promise<void> {
    const codeMessageId = interaction.message.reference?.messageId!;
    const message = await interaction.channel?.messages.fetch(codeMessageId)!;

    axios
      .get(`https://janda.mod.land/nhentai/get?book=${message.content}`, config)
      .then((res) => {
        const book = res.data.data;
        const embed = new EmbedBuilder()
          .setColor(0x0099ff)
          .setTitle(book.title)
          .setURL(res.data.source)
          .setAuthor({
            name: `${message.author.username}#${message.author.discriminator}`,
            iconURL: message.author.displayAvatarURL(),
          })
          .setDescription(book.optional_title ? book.optional_title.english : 'No optional names.')
          // .setThumbnail(book.image[0])
          .setThumbnail('https://archive.org/download/nhentai-logo-3/nhentai-logo-3.jpg')
          .addFields(
            { name: 'Parodies', value: book.parodies ? book.parodies : 'original' },
            { name: 'Characters', value: book.characters.length > 0 ? book.characters.join(', ') : 'original' },
            { name: 'Artists', value: book.artist?.join(', ') },
            { name: 'Tags', value: book.tags?.join(', ') },
            // { name: '\u200B', value: '\u200B' },
            { name: 'Favorites', value: book.num_favorites.toString(), inline: true },
            { name: 'Page count', value: book.num_pages.toString(), inline: true },
            { name: 'Language', value: book.language, inline: true },
          )
          .setImage(book.image[0])
          .setTimestamp()
          .addFields({ name: 'Upload date', value: book.upload_date })
          .setFooter({ text: 'NHentai', iconURL: 'https://archive.org/download/nhentai-logo-3/nhentai-logo-3.jpg' });

        interaction.reply({ embeds: [embed], ephemeral: true });
      })
      .catch((err) => {
        console.log(err);
        interaction.reply({ content: err.message, ephemeral: true });
      });
  }
}
