import type { APIEmbedField, User } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import { CommonConstants, MALConstants } from '../../constants/index.js';
import {
  IAnime,
  IAnimeCharacter,
  IAnimeEpisode,
  ICharacter,
  IGenre,
  IManga,
  IPeople,
  IUser,
  IUserAnime,
  IUserManga,
} from '../../types/mal';
import { datetimeConverter, replaceEmpties, tableConverter, timeDiff } from '../../utils/index.js';

export const MAL_AnimeEmbed = (resAnime: IAnime, author: User, page?: number, total?: number): EmbedBuilder => {
  const anime = replaceEmpties(resAnime, 'N/A', 'name' as keyof Object, true);

  return new EmbedBuilder()
    .setColor(MALConstants.COLOR_BY_APPROVED(anime.approved))
    .setTitle(`[${anime.mal_id}] ${anime.title}`)
    .setURL(anime.url)
    .setAuthor({
      name: `${author.username}#${author.discriminator}`,
      iconURL: author.displayAvatarURL(),
    })
    .setDescription(anime.title_japanese ? anime.title_japanese : anime.title)
    .setThumbnail(MALConstants.MAL_LOGO)
    .addFields(
      { name: 'Episodes', value: anime.episodes.toString(), inline: true },
      { name: 'Duration', value: anime.duration, inline: true },
      { name: 'Status', value: anime.status, inline: true },
      { name: 'Type', value: anime.type, inline: true },
      {
        name: 'Season',
        value: anime.season !== 'N/A' || anime.year !== 'N/A' ? `${anime.season} - ${anime.year?.toString()}` : 'N/A',
        inline: true,
      },
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
      text: `MyAnimeList ${page !== null && total !== null && `(${page?.toString()}/${total?.toString()})`}`,
      iconURL: MALConstants.MAL_LOGO,
    });
};

export const MAL_MangaEmbed = (resManga: IManga, author: User, page?: number, total?: number): EmbedBuilder => {
  const manga = replaceEmpties(resManga, 'N/A', 'name' as keyof Object, true);

  return new EmbedBuilder()
    .setColor(MALConstants.COLOR_BY_APPROVED(manga.approved))
    .setTitle(`[${manga.mal_id}] ${manga.title}`)
    .setURL(manga.url)
    .setAuthor({
      name: `${author.username}#${author.discriminator}`,
      iconURL: author.displayAvatarURL(),
    })
    .setDescription(manga.title_japanese ? manga.title_japanese : manga.title)
    .setThumbnail(MALConstants.MAL_LOGO)
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
      text: `MyAnimeList ${page !== null && total !== null && `(${page?.toString()}/${total?.toString()})`}`,
      iconURL: MALConstants.MAL_LOGO,
    });
};

export const MAL_CharacterEmbed = (
  resCharacter: ICharacter,
  author: User,
  page?: number,
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
    .setThumbnail(MALConstants.MAL_LOGO)
    .addFields({ name: 'Nicknames', value: character.nicknames })
    .addFields({ name: 'Favorites', value: character.favorites.toString() })
    .addFields({
      name: 'About',
      value: character.about.length < 1024 ? character.about : `${character.about.substring(0, 1020)}...`,
    })
    .setImage(character.images.jpg.image_url)
    .setTimestamp()
    .setFooter({
      text: `MyAnimeList ${page !== null && total !== null && `(${page?.toString()}/${total?.toString()})`}`,
      iconURL: MALConstants.MAL_LOGO,
    });
};

export const MAL_PeopleEmbed = (resPeople: IPeople, author: User, page?: number, total?: number): EmbedBuilder => {
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
    .setThumbnail(MALConstants.MAL_LOGO)
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
      text: `MyAnimeList ${page !== null && total !== null && `(${page?.toString()}/${total?.toString()})`}`,
      iconURL: MALConstants.MAL_LOGO,
    });
};

export const MAL_GenresEmbed = (genres: Array<IGenre>, author: User, page?: number, total?: number): EmbedBuilder => {
  let list = genres.map((genre: IGenre) =>
    Object({
      id: genre.mal_id,
      name: genre.name,
      count: genre.count,
    }),
  );

  const columnConfigs: Array<any> = [{ alignment: 'left' }, { alignment: 'right' }, { alignment: 'right' }];

  return (
    new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('Server quotes list')
      .setAuthor({
        name: `${author.username}#${author.discriminator}`,
        iconURL: author.displayAvatarURL(),
      })
      .setDescription(`\`${tableConverter(list, columnConfigs)}\``)
      // .setDescription(tableConverter(list))
      // .setThumbnail()
      // .addFields({})
      .setTimestamp()
      .setFooter({
        text: `MyAnimeList ${page !== null && total !== null && `(${page?.toString()}/${total?.toString()})`}`,
        iconURL: MALConstants.MAL_LOGO,
      })
  );
};

export const MAL_AnimeEpisodeEmbed = (
  animeEpisodes: Array<IAnimeEpisode>,
  author: User,
  page?: number,
  total?: number,
): EmbedBuilder => {
  let list = animeEpisodes.map((episode: IAnimeEpisode) =>
    Object({
      id: episode.mal_id,
      title: episode.title,
      score: episode.score,
      aired: datetimeConverter(episode.aired).date,
    }),
  );

  const columnConfigs: Array<any> = [
    { alignment: 'center' },
    { alignment: 'left', width: 20, wrapWord: true },
    { alignment: 'right' },
    { alignment: 'right' },
  ];

  return (
    new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('Anime episodes')
      .setAuthor({
        name: `${author.username}#${author.discriminator}`,
        iconURL: author.displayAvatarURL(),
      })
      .setDescription(`\`${tableConverter(list, columnConfigs)}\``)
      // .setDescription(tableConverter(list))
      // .setThumbnail()
      // .addFields({})
      .setTimestamp()
      .setFooter({
        text: `MyAnimeList ${page !== null && total !== null && `(${page?.toString()}/${total?.toString()})`}`,
        iconURL: MALConstants.MAL_LOGO,
      })
  );
};

export const MAL_AnimeThemeEmbed = (animeTheme: any, author: User): EmbedBuilder => {
  return new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(`[${animeTheme.anime_mal_id}] Anime themes`)
    .setAuthor({
      name: `${author.username}#${author.discriminator}`,
      iconURL: author.displayAvatarURL(),
    })
    .setDescription(`Openings: ${animeTheme.openings.length}\nEndings: ${animeTheme.endings.length}`)
    .setThumbnail(MALConstants.MAL_LOGO)
    .addFields({
      name: 'Openings',
      value: animeTheme.openings.length > 0 ? `- ${animeTheme.openings.join('\n- ')}` : 'N/A',
    })
    .addFields({
      name: 'Endings',
      value: animeTheme.endings.length > 0 ? `- ${animeTheme.endings.join('\n- ')}` : 'N/A',
    })
    .setTimestamp()
    .setFooter({
      text: `MyAnimeList`,
      iconURL: MALConstants.MAL_LOGO,
    });
};

export const MAL_AnimeStaffEmbed = (animeStaff: any, author: User, page?: number, total?: number): EmbedBuilder => {
  return (
    new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(animeStaff.person.name)
      .setURL(animeStaff.person.url)
      .setAuthor({
        name: `${author.username}#${author.discriminator}`,
        iconURL: author.displayAvatarURL(),
      })
      .setDescription(animeStaff.positions.map((position: string) => `- ${position}`).join('\n'))
      .setThumbnail(MALConstants.MAL_LOGO)
      // .addFields(voices)
      .setImage(animeStaff.person.images.jpg.image_url)
      .setTimestamp()
      .setFooter({
        text: `MyAnimeList ${page !== null && total !== null && `(${page?.toString()}/${total?.toString()})`}`,
        iconURL: MALConstants.MAL_LOGO,
      })
  );
};

export const MAL_AnimeStatisticsEmbed = (
  animeStatistics: any,
  author: User,
  page?: number,
  total?: number,
): EmbedBuilder => {
  const columnConfigs: Array<any> = [{ alignment: 'left' }, { alignment: 'right' }];
  const convertedAllStat = Object.entries(animeStatistics.overAllStat);

  return new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(`[${animeStatistics.mal_id}] Anime statistics`)
    .setAuthor({
      name: `${author.username}#${author.discriminator}`,
      iconURL: author.displayAvatarURL(),
    })
    .setDescription(`\`${tableConverter(convertedAllStat, columnConfigs, false)}\``)
    .setThumbnail(MALConstants.MAL_LOGO)
    .setImage(animeStatistics.chart)
    .setTimestamp()
    .setFooter({ text: `MyAnimeList`, iconURL: MALConstants.MAL_LOGO });
};

export const MAL_AnimeCharacterEmbed = (
  animeCharacter: IAnimeCharacter,
  author: User,
  page?: number,
  total?: number,
): EmbedBuilder => {
  const voiceActors: Array<any> = animeCharacter.voice_actors;

  const voices: Array<APIEmbedField> = Object.assign(
    voiceActors.map((voiceActor: any) =>
      Object({
        name: voiceActor.language,
        value: `[${voiceActor.person.name}](${voiceActor.person.url})`,
      }),
    ),
  );

  return new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(animeCharacter.character.name)
    .setURL(animeCharacter.character.url)
    .setAuthor({
      name: `${author.username}#${author.discriminator}`,
      iconURL: author.displayAvatarURL(),
    })
    .setDescription(animeCharacter.role)
    .setThumbnail(MALConstants.MAL_LOGO)
    .addFields([{ name: 'Favorites', value: animeCharacter.favorites.toString() }, ...voices])
    .setImage(animeCharacter.character.images.jpg.image_url)
    .setTimestamp()
    .setFooter({
      text: `MyAnimeList ${page !== null && total !== null && `(${page?.toString()}/${total?.toString()})`}`,
      iconURL: MALConstants.MAL_LOGO,
    });
};

export const MAL_MangaCharacterEmbed = (
  mangaCharacter: any,
  author: User,
  page?: number,
  total?: number,
): EmbedBuilder => {
  return new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(mangaCharacter.character.name)
    .setURL(mangaCharacter.character.url)
    .setAuthor({
      name: `${author.username}#${author.discriminator}`,
      iconURL: author.displayAvatarURL(),
    })
    .setDescription(mangaCharacter.role)
    .setThumbnail(MALConstants.MAL_LOGO)
    .setImage(mangaCharacter.character.images.jpg.image_url)
    .setTimestamp()
    .setFooter({
      text: `MyAnimeList ${page !== null && total !== null && `(${page?.toString()}/${total?.toString()})`}`,
      iconURL: MALConstants.MAL_LOGO,
    });
};

export const MAL_MangaStatisticsEmbed = (mangaStatistics: any, author: User): EmbedBuilder => {
  const columnConfigs: Array<any> = [{ alignment: 'left' }, { alignment: 'right' }];
  const convertedAllStat = Object.entries(mangaStatistics.overAllStat);

  return new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(`[${mangaStatistics.mal_id}] Manga statistics`)
    .setAuthor({
      name: `${author.username}#${author.discriminator}`,
      iconURL: author.displayAvatarURL(),
    })
    .setDescription(`\`${tableConverter(convertedAllStat, columnConfigs, false)}\``)
    .setThumbnail(MALConstants.MAL_LOGO)
    .setImage(mangaStatistics.chart)
    .setTimestamp()
    .setFooter({ text: `MyAnimeList`, iconURL: MALConstants.MAL_LOGO });
};

export const MAL_UserEmbed = (userData: IUser, author: User, chart?: string): EmbedBuilder => {
  userData = replaceEmpties(userData, 'N/A');

  return new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(`[${userData.id}] ${userData.name}`)
    .setURL(`https://myanimelist.net/profile/${userData.name}`)
    .setAuthor({
      name: `${author.username}#${author.discriminator}`,
      iconURL: author.displayAvatarURL(),
    })
    .setDescription(
      `Gender: ${userData.gender ? CommonConstants.GENDER_MAP[userData.gender as keyof Object] : 'unknown'}`,
    )
    .addFields(
      { name: 'Location', value: userData.location!, inline: true },
      { name: 'Time zone', value: userData.time_zone!, inline: true },
      {
        name: 'Joined at',
        value: `${datetimeConverter(userData.joined_at!).date} (${timeDiff(userData.joined_at!)})`,
        inline: true,
      },
    )
    .setThumbnail(userData.picture ?? null)
    .setImage(chart ?? null)
    .setTimestamp()
    .setFooter({ text: `MyAnimeList`, iconURL: MALConstants.MAL_LOGO });
};

export const MAL_UserAnimeEmbed = (
  userAnime: IUserAnime,
  author: User,
  page?: number,
  total?: number,
): EmbedBuilder => {
  // const anime = replaceEmpties(userAnime, 'N/A', 'name' as keyof Object, true);

  const watchStatus: Array<APIEmbedField> = [];

  userAnime.list_status.start_date &&
    watchStatus.push({
      name: 'Start date',
      value: datetimeConverter(userAnime.list_status.start_date).date,
    });
  userAnime.list_status.finish_date &&
    watchStatus.push({
      name: 'Finish date',
      value: datetimeConverter(userAnime.list_status.finish_date).date,
    });
  userAnime.list_status.updated_at &&
    watchStatus.push({
      name: 'Last update',
      value: datetimeConverter(userAnime.list_status.updated_at as Date).datetime,
    });

  return new EmbedBuilder()
    .setColor(MALConstants.MAL_ANIME_STATUS_COLORS[userAnime.list_status.status])
    .setTitle(`[${userAnime.node.id}] ${userAnime.node.title} \`<${userAnime.list_status.status}>\``)
    .setURL(`${MALConstants.MAL_ANIME_URL}/${userAnime.node.id}`)
    .setAuthor({
      name: `${author.username}#${author.discriminator}`,
      iconURL: author.displayAvatarURL(),
    })
    .setDescription(userAnime.list_status.is_rewatching ? 'Rewatching' : null)
    .setThumbnail(MALConstants.MAL_LOGO)
    .addFields(
      { name: 'Score', value: userAnime.list_status.score.toString(), inline: true },
      { name: 'Episodes watched', value: userAnime.list_status.num_episodes_watched.toString(), inline: true },
      ...watchStatus,
    )
    .setImage(userAnime.node.main_picture?.large ?? userAnime.node.main_picture?.medium)
    .setTimestamp()
    .setFooter({
      text: `MyAnimeList ${page !== null && total !== null && `(${page?.toString()}/${total?.toString()})`}`,
      iconURL: MALConstants.MAL_LOGO,
    });
};
export const MAL_UserMangaEmbed = (
  userManga: IUserManga,
  author: User,
  page?: number,
  total?: number,
): EmbedBuilder => {
  // const manga = replaceEmpties(userManga, 'N/A', 'name' as keyof Object, true);
  const readStatus: Array<APIEmbedField> = [];

  userManga.list_status.start_date &&
    readStatus.push({
      name: 'Start date',
      value: datetimeConverter(userManga.list_status.start_date).date,
    });
  userManga.list_status.finish_date &&
    readStatus.push({
      name: 'Finish date',
      value: datetimeConverter(userManga.list_status.finish_date).date,
    });
  userManga.list_status.updated_at &&
    readStatus.push({
      name: 'Last update',
      value: datetimeConverter(userManga.list_status.updated_at as Date).datetime,
    });

  return new EmbedBuilder()
    .setColor(MALConstants.MAL_MANGA_STATUS_COLORS[userManga.list_status.status])
    .setTitle(`[${userManga.node.id}] ${userManga.node.title} \`${userManga.list_status.status}\``)
    .setURL(`${MALConstants.MAL_MANGA_URL}/${userManga.node.id}`)
    .setAuthor({
      name: `${author.username}#${author.discriminator}`,
      iconURL: author.displayAvatarURL(),
    })
    .setDescription(userManga.list_status.is_rereading ? 'Rewatching' : null)
    .setThumbnail(MALConstants.MAL_LOGO)
    .addFields(
      { name: 'Volumes read', value: userManga.list_status.num_volumes_read.toString(), inline: true },
      { name: 'Chapters read', value: userManga.list_status.num_chapters_read.toString(), inline: true },
      { name: 'Score', value: userManga.list_status.score.toString(), inline: true },
      ...readStatus,
    )
    .setImage(userManga.node.main_picture?.large ?? userManga.node.main_picture?.medium)
    .setTimestamp()
    .setFooter({
      text: `MyAnimeList ${page !== null && total !== null && `(${page?.toString()}/${total?.toString()})`}`,
      iconURL: MALConstants.MAL_LOGO,
    });
};
