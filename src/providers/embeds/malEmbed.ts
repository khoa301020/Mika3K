import type { User } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import { Constants } from '../../constants/constants.js';
import { datetimeConverter, replaceEmpties } from '../../helpers/helper.js';
import { IAnime, ICharacter, IManga, IPeople } from '../../types/mal';

export const MAL_AnimeEmbed = (resAnime: IAnime, author: User, index?: number, total?: number): EmbedBuilder => {
  const anime = replaceEmpties(resAnime, 'N/A', 'name' as keyof Object, true);

  return new EmbedBuilder()
    .setColor(Constants.COLOR_BY_APPROVED(anime.approved))
    .setTitle(`[${anime.mal_id}] ${anime.title}`)
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
    .addFields({
      name: 'Synopsis',
      value: anime.synopsis.length < 1024 ? anime.synopsis : `${anime.synopsis.substring(0, 1020)}...`,
    })
    .setImage(anime.images.jpg.large_image_url)
    .setTimestamp()
    .setFooter({
      text: `MyAnimeList ${index !== null && total !== null && `(${index?.toString()}/${total?.toString()})`}`,
      iconURL: Constants.MAL_LOGO,
    });
};

export const MAL_MangaEmbed = (resManga: IManga, author: User, index?: number, total?: number): EmbedBuilder => {
  const manga = replaceEmpties(resManga, 'N/A', 'name' as keyof Object, true);

  return new EmbedBuilder()
    .setColor(Constants.COLOR_BY_APPROVED(manga.approved))
    .setTitle(`[${manga.mal_id}] ${manga.title}`)
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
    .addFields({
      name: 'Synopsis',
      value: manga.synopsis.length < 1024 ? manga.synopsis : `${manga.synopsis.substring(0, 1020)}...`,
    })
    .setImage(manga.images.jpg.large_image_url)
    .setTimestamp()
    .setFooter({
      text: `MyAnimeList ${index !== null && total !== null && `(${index?.toString()}/${total?.toString()})`}`,
      iconURL: Constants.MAL_LOGO,
    });
};

export const MAL_CharacterEmbed = (
  resCharacter: ICharacter,
  author: User,
  index?: number,
  total?: number,
): EmbedBuilder => {
  const character = replaceEmpties(resCharacter, 'N/A');

  return new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(`[${character.mal_id}] ${character.name}`)
    .setURL(character.url)
    .setAuthor({
      name: `${author.username}#${author.discriminator}`,
      iconURL: author.displayAvatarURL(),
    })
    .setDescription(character.name_kanji)
    .setThumbnail(Constants.MAL_LOGO)
    .addFields({ name: 'Nicknames', value: character.nicknames })
    .addFields({ name: 'Favorites', value: character.favorites.toString() })
    .addFields({
      name: 'About',
      value: character.about.length < 1024 ? character.about : `${character.about.substring(0, 1020)}...`,
    })
    .setImage(character.images.jpg.image_url)
    .setTimestamp()
    .setFooter({
      text: `MyAnimeList ${index !== null && total !== null && `(${index?.toString()}/${total?.toString()})`}`,
      iconURL: Constants.MAL_LOGO,
    });
};

export const MAL_PeopleEmbed = (resPeople: IPeople, author: User, index?: number, total?: number): EmbedBuilder => {
  const people = replaceEmpties(resPeople, 'N/A');

  return new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(`[${people.mal_id}] ${people.name}`)
    .setURL(people.url)
    .setAuthor({
      name: `${author.username}#${author.discriminator}`,
      iconURL: author.displayAvatarURL(),
    })
    .setDescription(`${people.given_name}, ${people.family_name}`)
    .setThumbnail(Constants.MAL_LOGO)
    .addFields({ name: 'Alternate names', value: people.alternate_names })
    .addFields(
      { name: 'Birthday', value: datetimeConverter(people.birthday).date, inline: true },
      { name: 'Favorites', value: people.favorites.toString(), inline: true },
    )
    .addFields({ name: 'Website URL', value: people.website_url })
    .addFields({
      name: 'About',
      value: people.about.length < 1024 ? people.about : `${people.about.substring(0, 1020)}...`,
    })
    .setImage(people.images.jpg.image_url)
    .setTimestamp()
    .setFooter({
      text: `MyAnimeList ${index !== null && total !== null && `(${index?.toString()}/${total?.toString()})`}`,
      iconURL: Constants.MAL_LOGO,
    });
};
