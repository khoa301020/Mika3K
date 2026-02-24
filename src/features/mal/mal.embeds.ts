import { Injectable } from '@nestjs/common';
import type { APIEmbedField, User } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import * as C from './mal.constants';
import type {
  IAnime,
  IAnimeCharacter,
  IAnimeEpisode,
  ICharacter,
  IGenre,
  IManga,
  IPeople,
} from './mal.types';
import { datetimeConverter, tableConverter } from '../../shared/utils';

function replaceEmpties(
  obj: any,
  replacement: string,
  joinKey?: string,
  joinArrays?: boolean,
): any {
  const result = { ...obj };
  for (const key in result) {
    if (result[key] == null || result[key] === '') result[key] = replacement;
    if (joinArrays && Array.isArray(result[key])) {
      result[key] =
        result[key].length > 0
          ? result[key]
              .map((item: any) => (joinKey ? item[joinKey] : item))
              .join(', ')
          : replacement;
    }
  }
  return result;
}

function malFooter(page?: number, total?: number) {
  return {
    text: `MyAnimeList${page != null && total != null ? ` (${page}/${total})` : ''}`,
    iconURL: C.MAL_LOGO,
  };
}

@Injectable()
export class MalEmbeds {
  anime(
    resAnime: IAnime,
    author: User,
    page?: number,
    total?: number,
  ): EmbedBuilder {
    const anime = replaceEmpties(resAnime, 'N/A', 'name', true);
    return new EmbedBuilder()
      .setColor(C.COLOR_BY_APPROVED(anime.approved))
      .setTitle(`[${anime.mal_id}] ${anime.title}`)
      .setURL(anime.url)
      .setAuthor({ name: author.username, iconURL: author.displayAvatarURL() })
      .setDescription(anime.title_japanese || anime.title)
      .setThumbnail(C.MAL_LOGO)
      .addFields(
        { name: 'Episodes', value: String(anime.episodes), inline: true },
        { name: 'Duration', value: anime.duration, inline: true },
        { name: 'Status', value: anime.status, inline: true },
        { name: 'Type', value: anime.type, inline: true },
        {
          name: 'Season',
          value:
            anime.season !== 'N/A' ? `${anime.season} - ${anime.year}` : 'N/A',
          inline: true,
        },
        { name: 'Aired', value: anime.aired.string, inline: true },
        { name: 'Rating', value: anime.rating, inline: true },
        { name: 'Score', value: String(anime.score), inline: true },
        { name: 'Rank', value: String(anime.rank), inline: true },
        { name: 'Member', value: String(anime.members), inline: true },
        { name: 'Favorites', value: String(anime.favorites), inline: true },
        { name: 'Source', value: anime.source, inline: true },
      )
      .addFields(
        { name: 'Studios', value: anime.studios, inline: true },
        { name: 'Genres', value: anime.genres },
      )
      .addFields({
        name: 'Synopsis',
        value:
          (anime.synopsis?.length ?? 0) < 1024
            ? anime.synopsis
            : `${anime.synopsis.substring(0, 1020)}...`,
      })
      .setImage(anime.images?.jpg?.large_image_url)
      .setTimestamp()
      .setFooter(malFooter(page, total));
  }

  manga(
    resManga: IManga,
    author: User,
    page?: number,
    total?: number,
  ): EmbedBuilder {
    const manga = replaceEmpties(resManga, 'N/A', 'name', true);
    return new EmbedBuilder()
      .setColor(C.COLOR_BY_APPROVED(manga.approved))
      .setTitle(`[${manga.mal_id}] ${manga.title}`)
      .setURL(manga.url)
      .setAuthor({ name: author.username, iconURL: author.displayAvatarURL() })
      .setDescription(manga.title_japanese || manga.title)
      .setThumbnail(C.MAL_LOGO)
      .addFields(
        { name: 'Type', value: manga.type, inline: true },
        { name: 'Volumes', value: String(manga.volumes), inline: true },
        { name: 'Chapters', value: String(manga.chapters), inline: true },
        { name: 'Score', value: String(manga.score), inline: true },
        { name: 'Rank', value: String(manga.rank), inline: true },
        { name: 'Member', value: String(manga.members), inline: true },
      )
      .addFields({ name: 'Genres', value: manga.genres })
      .addFields({
        name: 'Synopsis',
        value:
          (manga.synopsis?.length ?? 0) < 1024
            ? manga.synopsis
            : `${manga.synopsis.substring(0, 1020)}...`,
      })
      .setImage(manga.images?.jpg?.large_image_url)
      .setTimestamp()
      .setFooter(malFooter(page, total));
  }

  character(
    resChar: ICharacter,
    author: User,
    page?: number,
    total?: number,
  ): EmbedBuilder {
    const character = replaceEmpties(resChar, 'N/A');
    return new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(`[${character.mal_id}] ${character.name}`)
      .setURL(character.url)
      .setAuthor({ name: author.username, iconURL: author.displayAvatarURL() })
      .setDescription(character.name_kanji)
      .setThumbnail(C.MAL_LOGO)
      .addFields({ name: 'Nicknames', value: character.nicknames })
      .addFields({ name: 'Favorites', value: String(character.favorites) })
      .addFields({
        name: 'About',
        value:
          (character.about?.length ?? 0) < 1024
            ? character.about
            : `${character.about.substring(0, 1020)}...`,
      })
      .setImage(character.images?.jpg?.image_url)
      .setTimestamp()
      .setFooter(malFooter(page, total));
  }

  people(
    resPeople: IPeople,
    author: User,
    page?: number,
    total?: number,
  ): EmbedBuilder {
    const people = replaceEmpties(resPeople, 'N/A');
    return new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(`[${people.mal_id}] ${people.name}`)
      .setURL(people.url)
      .setAuthor({ name: author.username, iconURL: author.displayAvatarURL() })
      .setDescription(`${people.given_name}, ${people.family_name}`)
      .setThumbnail(C.MAL_LOGO)
      .addFields(
        {
          name: 'Birthday',
          value: datetimeConverter(people.birthday).date,
          inline: true,
        },
        { name: 'Favorites', value: String(people.favorites), inline: true },
      )
      .addFields({
        name: 'About',
        value:
          (people.about?.length ?? 0) < 1024
            ? people.about
            : `${people.about.substring(0, 1020)}...`,
      })
      .setImage(people.images?.jpg?.image_url)
      .setTimestamp()
      .setFooter(malFooter(page, total));
  }

  genres(
    genres: IGenre[],
    author: User,
    page?: number,
    total?: number,
  ): EmbedBuilder {
    const list = genres.map((g) => ({
      id: g.mal_id,
      name: g.name,
      count: g.count,
    }));
    const columnConfigs = [
      { alignment: 'left' },
      { alignment: 'right' },
      { alignment: 'right' },
    ];
    return new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('Genres list')
      .setAuthor({ name: author.username, iconURL: author.displayAvatarURL() })
      .setDescription(`\`${tableConverter(list, columnConfigs)}\``)
      .setTimestamp()
      .setFooter(malFooter(page, total));
  }

  animeEpisodes(
    episodes: IAnimeEpisode[],
    author: User,
    page?: number,
    total?: number,
  ): EmbedBuilder {
    const list = episodes.map((ep) => ({
      id: ep.mal_id,
      title: ep.title,
      score: ep.score,
      aired: datetimeConverter(ep.aired).date,
    }));
    const columnConfigs = [
      { alignment: 'center' },
      { alignment: 'left', width: 20, wrapWord: true },
      { alignment: 'right' },
      { alignment: 'right' },
    ];
    return new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('Anime episodes')
      .setAuthor({ name: author.username, iconURL: author.displayAvatarURL() })
      .setDescription(`\`${tableConverter(list, columnConfigs)}\``)
      .setTimestamp()
      .setFooter(malFooter(page, total));
  }

  animeTheme(theme: any, author: User): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(`[${theme.anime_mal_id}] Anime themes`)
      .setAuthor({ name: author.username, iconURL: author.displayAvatarURL() })
      .setDescription(
        `Openings: ${theme.openings.length}\nEndings: ${theme.endings.length}`,
      )
      .setThumbnail(C.MAL_LOGO)
      .addFields({
        name: 'Openings',
        value:
          theme.openings.length > 0
            ? `- ${theme.openings.join('\n- ')}`
            : 'N/A',
      })
      .addFields({
        name: 'Endings',
        value:
          theme.endings.length > 0 ? `- ${theme.endings.join('\n- ')}` : 'N/A',
      })
      .setTimestamp()
      .setFooter({ text: 'MyAnimeList', iconURL: C.MAL_LOGO });
  }

  animeStaff(
    staff: any,
    author: User,
    page?: number,
    total?: number,
  ): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(staff.person.name)
      .setURL(staff.person.url)
      .setAuthor({ name: author.username, iconURL: author.displayAvatarURL() })
      .setDescription(staff.positions.map((p: string) => `- ${p}`).join('\n'))
      .setThumbnail(C.MAL_LOGO)
      .setImage(staff.person.images?.jpg?.image_url)
      .setTimestamp()
      .setFooter(malFooter(page, total));
  }

  animeStatistics(stats: any, author: User): EmbedBuilder {
    const columnConfigs = [{ alignment: 'left' }, { alignment: 'right' }];
    const converted = Object.entries(stats.overAllStat);
    return new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(`[${stats.mal_id}] Anime statistics`)
      .setAuthor({ name: author.username, iconURL: author.displayAvatarURL() })
      .setDescription(`\`${tableConverter(converted, columnConfigs, false)}\``)
      .setThumbnail(C.MAL_LOGO)
      .setImage(stats.chart)
      .setTimestamp()
      .setFooter({ text: 'MyAnimeList', iconURL: C.MAL_LOGO });
  }

  animeCharacter(
    char: IAnimeCharacter,
    author: User,
    page?: number,
    total?: number,
  ): EmbedBuilder {
    const voices: APIEmbedField[] = (char.voice_actors ?? []).map(
      (va: any) => ({
        name: va.language,
        value: `[${va.person.name}](${va.person.url})`,
      }),
    );
    return new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(char.character.name)
      .setURL(char.character.url)
      .setAuthor({ name: author.username, iconURL: author.displayAvatarURL() })
      .setDescription(char.role)
      .setThumbnail(C.MAL_LOGO)
      .addFields([
        { name: 'Favorites', value: String(char.favorites) },
        ...voices,
      ])
      .setImage(char.character.images?.jpg?.image_url)
      .setTimestamp()
      .setFooter(malFooter(page, total));
  }

  mangaCharacter(
    char: any,
    author: User,
    page?: number,
    total?: number,
  ): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(char.character.name)
      .setURL(char.character.url)
      .setAuthor({ name: author.username, iconURL: author.displayAvatarURL() })
      .setDescription(char.role)
      .setThumbnail(C.MAL_LOGO)
      .setImage(char.character.images?.jpg?.image_url)
      .setTimestamp()
      .setFooter(malFooter(page, total));
  }

  mangaStatistics(stats: any, author: User): EmbedBuilder {
    const columnConfigs = [{ alignment: 'left' }, { alignment: 'right' }];
    const converted = Object.entries(stats.overAllStat);
    return new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(`[${stats.mal_id}] Manga statistics`)
      .setAuthor({ name: author.username, iconURL: author.displayAvatarURL() })
      .setDescription(`\`${tableConverter(converted, columnConfigs, false)}\``)
      .setThumbnail(C.MAL_LOGO)
      .setImage(stats.chart)
      .setTimestamp()
      .setFooter({ text: 'MyAnimeList', iconURL: C.MAL_LOGO });
  }
}
