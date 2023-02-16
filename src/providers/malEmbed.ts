import type { AxiosResponse } from 'axios';
import type { User } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import { Constants } from '../constants/constants.js';

export const MAL_AnimeEmbed = (res: AxiosResponse, author: User): EmbedBuilder => {
  const anime = res.data.data[0];
  const studios = anime.studios.length > 0 ? anime.studios.map((studio: any) => studio.name).join(', ') : 'N/A';
  const licensors =
    anime.licensors.length > 0 ? anime.licensors.map((licensor: any) => licensor.name).join(', ') : 'N/A';
  const producers =
    anime.producers.length > 0 ? anime.producers.map((producer: any) => producer.name).join(', ') : 'N/A';
  const genres = anime.genres.length > 0 ? anime.genres.map((genre: any) => genre.name).join(', ') : 'N/A';
  const themes = anime.themes.length > 0 ? anime.themes.map((theme: any) => theme.name).join(', ') : 'N/A';

  return (
    new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(anime.title)
      .setURL(anime.url)
      .setAuthor({
        name: `${author.username}#${author.discriminator}`,
        iconURL: author.displayAvatarURL(),
      })
      .setDescription(anime.title_japanese ? anime.title_japanese : anime.title)
      .setThumbnail(Constants.MAL_LOGO)
      .addFields(
        { name: 'Episodes', value: anime.episodes.toString(), inline: true },
        { name: 'Status', value: anime.status, inline: true },
      )
      .addFields(
        { name: 'Duration', value: anime.duration, inline: true },
        { name: 'Source', value: anime.source, inline: true },
      )
      .addFields(
        { name: 'Year', value: anime.year?.toString() ?? 'N/A', inline: true },
        { name: 'Season', value: anime.season ?? 'N/A', inline: true },
      )
      .addFields(
        { name: 'Studios', value: studios, inline: true },
        { name: 'Licensors', value: licensors, inline: true },
      )
      .addFields({ name: 'Producers', value: producers })
      .addFields({ name: 'Genres', value: genres })
      .addFields({ name: 'Themes', value: themes })
      // .addFields({ name: 'Synopsis', value: anime.synopsis })
      .setImage(anime.images.jpg.image_url)
      .setTimestamp()
      .setFooter({ text: 'MyAnimeList', iconURL: Constants.MAL_LOGO })
  );
};
