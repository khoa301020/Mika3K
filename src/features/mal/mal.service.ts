import { Injectable } from '@nestjs/common';
import { AppHttpService } from '../../shared/http';
import * as C from './mal.constants';
import type { IAnimeEpisode } from './mal.types';

@Injectable()
export class MalService {
  constructor(private readonly httpService: AppHttpService) {}

  // --- Anime ---
  async animeSearch(queryString: string) {
    const { data } = await this.httpService.get(
      `${C.JIKAN_ANIME_SEARCH}?${queryString}`,
    );
    return data;
  }
  async animeGenres(queryString: string) {
    const { data } = await this.httpService.get(
      `${C.JIKAN_GENRES_ANIME}?${queryString}`,
    );
    return data;
  }
  async animeCharacters(id: string) {
    const { data } = await this.httpService.get(C.ANIME_CHARACTERS(id));
    return data;
  }
  async animeEpisodes(id: string): Promise<IAnimeEpisode[]> {
    let page = 1;
    const { data: first } = await this.httpService.get(
      `${C.ANIME_EPISODES(id)}?page=${page}`,
    );
    let all: any[] = first.data;
    const totalPages = first.pagination?.last_visible_page ?? 1;
    while (page < totalPages) {
      page++;
      const { data: next } = await this.httpService.get(
        `${C.ANIME_EPISODES(id)}?page=${page}`,
      );
      all = [...all, ...next.data];
    }
    return all;
  }
  async animeThemes(id: string) {
    const { data } = await this.httpService.get(C.ANIME_THEMES(id));
    return data;
  }
  async animeStaff(id: string) {
    const { data } = await this.httpService.get(C.ANIME_STAFF(id));
    return data;
  }
  async animeStatistics(id: string) {
    const { data } = await this.httpService.get(C.ANIME_STATISTICS(id));
    return data;
  }

  // --- Manga ---
  async mangaSearch(queryString: string) {
    const { data } = await this.httpService.get(
      `${C.JIKAN_MANGA_SEARCH}?${queryString}`,
    );
    return data;
  }
  async mangaGenres(queryString: string) {
    const { data } = await this.httpService.get(
      `${C.JIKAN_GENRES_MANGA}?${queryString}`,
    );
    return data;
  }
  async mangaCharacters(id: string) {
    const { data } = await this.httpService.get(C.MANGA_CHARACTERS(id));
    return data;
  }
  async mangaStatistics(id: string) {
    const { data } = await this.httpService.get(C.MANGA_STATISTICS(id));
    return data;
  }

  // --- Character ---
  async characterSearch(queryString: string) {
    const { data } = await this.httpService.get(
      `${C.JIKAN_CHARACTER_SEARCH}?${queryString}`,
    );
    return data;
  }

  // --- People ---
  async peopleSearch(queryString: string) {
    const { data } = await this.httpService.get(
      `${C.JIKAN_PEOPLE_SEARCH}?${queryString}`,
    );
    return data;
  }
}
