import { IAnime, IManga } from '@shineiichijo/marika';
import type { User } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import { Constants } from '../../constants/constants.js';
import { replaceEmpties } from '../../helpers/index.js';

export const MAL_AnimeEmbed = (resAnime: IAnime, author: User): EmbedBuilder => {
  const anime = replaceEmpties(resAnime, 'name' as keyof Object, 'N/A');

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
        { name: 'Duration', value: anime.duration, inline: true },
        { name: 'Status', value: anime.status, inline: true },
        { name: 'Year', value: anime.year?.toString() ?? 'N/A', inline: true },
        { name: 'Season', value: anime.season ?? 'N/A', inline: true },
        { name: 'Aired', value: anime.aired.string, inline: true },
        { name: 'Rating', value: anime.rating, inline: true },
        { name: 'Score', value: anime.score.toString(), inline: true },
        { name: 'Scored by', value: anime.scored_by.toString(), inline: true },
        { name: 'Rank', value: anime.rank.toString(), inline: true },
        { name: 'Member', value: anime.members.toString(), inline: true },
        { name: 'Favorites', value: anime.favorites.toString(), inline: true },
        { name: 'Source', value: anime.source, inline: true },
        { name: 'Studios', value: anime.studios, inline: true },
        { name: 'Licensors', value: anime.licensors, inline: true },
      )
      .addFields({ name: 'Producers', value: anime.producers })
      .addFields({ name: 'Genres', value: anime.genres })
      .addFields({ name: 'Themes', value: anime.themes })
      // .addFields({ name: 'Synopsis', value: anime.synopsis })
      .setImage(anime.images.jpg.large_image_url)
      .setTimestamp()
      .setFooter({ text: 'MyAnimeList', iconURL: Constants.MAL_LOGO })
  );
};

export const MAL_MangaEmbed = (resAnime: IManga, author: User): EmbedBuilder => {
  const manga = replaceEmpties(resAnime, 'name' as keyof Object, 'N/A');

  return (
    new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(manga.title)
      .setURL(manga.url)
      .setAuthor({
        name: `${author.username}#${author.discriminator}`,
        iconURL: author.displayAvatarURL(),
      })
      .setDescription(manga.title_japanese ? manga.title_japanese : manga.title)
      .setThumbnail(Constants.MAL_LOGO)
      .addFields({ name: 'Authors', value: manga.authors })
      .addFields({ name: `Publish status:   \`${manga.status}\``, value: manga.published.string })
      .addFields(
        { name: 'Type', value: manga.type, inline: true },
        { name: 'Volumes', value: manga.volumes.toString(), inline: true },
        { name: 'Chapters', value: manga.chapters.toString(), inline: true },
        { name: 'Score', value: manga.score.toString(), inline: true },
        // { name: 'Scored by', value: manga.scored_by.toString(), inline: true },
        { name: 'Rank', value: manga.rank.toString(), inline: true },
        { name: 'Member', value: manga.members.toString(), inline: true },
        // { name: 'Favorites', value: manga.favorites.toString(), inline: true },
      )
      .addFields({ name: 'Serializations', value: manga.serializations })
      .addFields({ name: 'Genres', value: manga.genres })
      .addFields({ name: 'Themes', value: manga.themes })
      // .addFields({ name: 'Synopsis', value: anime.synopsis })
      .setImage(manga.images.jpg.large_image_url)
      .setTimestamp()
      .setFooter({ text: 'MyAnimeList', iconURL: Constants.MAL_LOGO })
  );
};
