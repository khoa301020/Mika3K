import axios from 'axios';
import { CommandInteraction, EmbedBuilder } from 'discord.js';
import { Discord, SimpleCommand, SimpleCommandMessage, Slash } from 'discordx';
import { Constants } from '../constants/constants.js';

let config = {
  headers: {
    'user-agent': Constants.USER_AGENT,
    cookie: `cf_clearance=${process.env.COOKIE}`,
  },
};

@Discord()
class Example {
  @Slash({ description: 'Get random NHentai nuke code', name: 'random-nuke' })
  async getRandomSlash(interaction: CommandInteraction): Promise<void> {
    axios
      .get(`${Constants.NHENTAI_API}/random`, config)
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
          .setThumbnail(Constants.NHENTAI_LOGO)
          .addFields(
            { name: 'Parodies', value: book.parodies ? book.parodies : 'original' },
            { name: 'Characters', value: book.characters.length > 0 ? book.characters.join(', ') : 'original' },
            { name: 'Artists', value: book.artist?.join(', ') },
            { name: 'Tags', value: book.tags.map((tag: string) => `\`${tag}\``).join(', ') },
            { name: 'Favorites', value: book.num_favorites.toString(), inline: true },
            { name: 'Pages count', value: book.num_pages.toString(), inline: true },
            { name: 'Language', value: book.language, inline: true },
          )
          .setImage(book.image[0])
          .setTimestamp()
          .addFields({ name: 'Upload date', value: book.upload_date })
          .setFooter({ text: 'NHentai', iconURL: Constants.NHENTAI_LOGO });

        interaction.reply({ embeds: [embed], ephemeral: true });
      })
      .catch((err) => {
        console.log(err);
        interaction.reply({ content: err.message, ephemeral: true });
      });
  }

  @SimpleCommand({ aliases: ['nhrandom', 'nr'], description: 'Get random NHentai nuke code' })
  getRandomCommand(command: SimpleCommandMessage): void {
    axios
      .get(`${Constants.NHENTAI_API}/random`, config)
      .then((res) => {
        const book = res.data.data;
        const embed = new EmbedBuilder()
          .setColor(0x0099ff)
          .setTitle(book.title)
          .setURL(res.data.source)
          .setAuthor({
            name: `${command.message.author.username}#${command.message.author.discriminator}`,
            iconURL: command.message.author.displayAvatarURL(),
          })
          .setDescription(book.optional_title ? book.optional_title.english : 'No optional names.')
          .setThumbnail(Constants.NHENTAI_LOGO)
          .addFields(
            { name: 'Parodies', value: book.parodies ? book.parodies : 'original' },
            { name: 'Characters', value: book.characters.length > 0 ? book.characters.join(', ') : 'original' },
            { name: 'Artists', value: book.artist?.join(', ') },
            { name: 'Tags', value: book.tags.map((tag: string) => `\`${tag}\``).join(', ') },
            { name: 'Favorites', value: book.num_favorites.toString(), inline: true },
            { name: 'Pages count', value: book.num_pages.toString(), inline: true },
            { name: 'Language', value: book.language, inline: true },
          )
          .setImage(book.image[0])
          .setTimestamp()
          .addFields({ name: 'Upload date', value: book.upload_date })
          .setFooter({ text: 'NHentai', iconURL: Constants.NHENTAI_LOGO });

        command.message.reply({ embeds: [embed] });
      })
      .catch((err) => {
        console.log(err);
        command.message.reply({ content: err.message });
      });
  }
}
