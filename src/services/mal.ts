import axios, { AxiosResponse } from 'axios';
import { GuildMember } from 'discord.js';
import qs from 'qs';
import { Constants } from '../constants/constants.js';
import MAL from '../models/MAL.js';

export const animeApi = {
  search: (queryString: string) => axios.get(`${Constants.JIKAN_ANIME_SEARCH}?${queryString}`),
  genres: (queryString: string) => axios.get(`${Constants.JIKAN_GENRES_ANIME}?${queryString}`),
  characters: (id: string) => axios.get(`${Constants.ANIME_CHARACTERS(id)}`),
  episodes: async (id: string): Promise<Array<any>> => {
    let page: number = 1;

    const res = await axios.get(`${Constants.ANIME_EPISODES(id)}?$page=${page}`);
    let data: Array<any> = res.data.data;
    const totalPages = res.data.pagination.last_visible_page;

    while (page < totalPages) {
      page++;
      const nextPage = await axios.get(`${Constants.ANIME_EPISODES(id)}?page=${page}`);
      data = [...data, ...nextPage.data.data];
    }

    return data;
  },
  themes: (id: string) => axios.get(`${Constants.ANIME_THEMES(id)}`),
  staff: (id: string) => axios.get(`${Constants.ANIME_STAFF(id)}`),
  // pictures: (id: string) => axios.get(`${Constants.ANIME_PICTURES(id)}`),
  statistics: (id: string) => axios.get(`${Constants.ANIME_STATISTICS(id)}`),
};

export const mangaApi = {
  search: (queryString: string) => axios.get(`${Constants.JIKAN_MANGA_SEARCH}?${queryString}`),
  genres: (queryString: string) => axios.get(`${Constants.JIKAN_GENRES_MANGA}?${queryString}`),
  characters: (id: string) => axios.get(`${Constants.MANGA_CHARACTERS(id)}`),
  pictures: (id: string) => axios.get(`${Constants.MANGA_PICTURES(id)}`),
  statistics: (id: string) => axios.get(`${Constants.MANGA_STATISTICS(id)}`),
};

export const characterApi = {
  search: (queryString: string) => axios.get(`${Constants.JIKAN_CHARACTER_SEARCH}?${queryString}`),
};

export const peopleApi = {
  search: (queryString: string) => axios.get(`${Constants.JIKAN_PEOPLE_SEARCH}?${queryString}`),
};

export const authApi = {
  savePKCE: async (user: GuildMember, code_challenge: string) => {
    const userId = user.user.id;
    const guildId = user.guild.id;
    return await MAL.findOneAndUpdate(
      { user: userId, guild: guildId },
      { codeChallenge: code_challenge },
      { new: true, upsert: true },
    );
  },
  getPKCE: async (user: GuildMember) => {
    const userId = user.user.id;
    const guildId = user.guild.id;
    return await MAL.findOne({ user: userId, guild: guildId }).select('codeChallenge');
  },
  getToken: async (data: any): Promise<AxiosResponse> => {
    return await axios({
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      data: qs.stringify(data),
      url: `${Constants.MAL_AUTH_API}/token`,
    });
  },
  saveToken: async (user: GuildMember, accessToken: string, refreshToken: string, expiresDate: Date) => {
    const userId = user.user.id;
    const guildId = user.guild.id;
    return await MAL.findOneAndUpdate(
      { user: userId, guild: guildId },
      { accessToken, refreshToken, expiresAt: expiresDate },
      { new: true },
    );
  },
};
