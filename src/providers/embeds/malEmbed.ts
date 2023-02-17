import { IAnime } from '@shineiichijo/marika';
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
      .setImage(anime.images.jpg.image_url)
      .setTimestamp()
      .setFooter({ text: 'MyAnimeList', iconURL: Constants.MAL_LOGO })
  );
};
