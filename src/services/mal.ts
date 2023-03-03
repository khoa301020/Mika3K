import axios, { AxiosResponse } from 'axios';
import qs from 'qs';
import { MALConstants } from '../constants/index.js';
import { expireDate } from '../helpers/helper.js';
import MAL from '../models/MAL.js';
import { IAnimeEpisode } from '../types/mal.js';

export const animeApi = {
  search: (queryString: string) => axios.get(`${MALConstants.JIKAN_ANIME_SEARCH}?${queryString}`),
  genres: (queryString: string) => axios.get(`${MALConstants.JIKAN_GENRES_ANIME}?${queryString}`),
  characters: (id: string) => axios.get(`${MALConstants.ANIME_CHARACTERS(id)}`),
  episodes: async (id: string): Promise<Array<IAnimeEpisode>> => {
    let page: number = 1;

    const res = await axios.get(`${MALConstants.ANIME_EPISODES(id)}?$page=${page}`);
    let data: Array<any> = res.data.data;
    const totalPages = res.data.pagination.last_visible_page;

    while (page < totalPages) {
      page++;
      const nextPage = await axios.get(`${MALConstants.ANIME_EPISODES(id)}?page=${page}`);
      data = [...data, ...nextPage.data.data];
    }

    return data;
  },
  themes: (id: string) => axios.get(`${MALConstants.ANIME_THEMES(id)}`),
  staff: (id: string) => axios.get(`${MALConstants.ANIME_STAFF(id)}`),
  // pictures: (id: string) => axios.get(`${MALConstants.ANIME_PICTURES(id)}`),
  statistics: (id: string) => axios.get(`${MALConstants.ANIME_STATISTICS(id)}`),
};
export const mangaApi = {
  search: (queryString: string) => axios.get(`${MALConstants.JIKAN_MANGA_SEARCH}?${queryString}`),
  genres: (queryString: string) => axios.get(`${MALConstants.JIKAN_GENRES_MANGA}?${queryString}`),
  characters: (id: string) => axios.get(`${MALConstants.MANGA_CHARACTERS(id)}`),
  pictures: (id: string) => axios.get(`${MALConstants.MANGA_PICTURES(id)}`),
  statistics: (id: string) => axios.get(`${MALConstants.MANGA_STATISTICS(id)}`),
};
export const characterApi = {
  search: (queryString: string) => axios.get(`${MALConstants.JIKAN_CHARACTER_SEARCH}?${queryString}`),
};
export const peopleApi = {
  search: (queryString: string) => axios.get(`${MALConstants.JIKAN_PEOPLE_SEARCH}?${queryString}`),
};
export const authApi = {
  checkAuthorized: async (userId: string) => {
    return await MAL.findOne({ userId, expiresAt: { $gt: new Date() } });
  },
  savePKCE: async (userId: string, code_challenge: string) => {
    return await MAL.findOneAndUpdate({ userId }, { codeChallenge: code_challenge }, { new: true, upsert: true });
  },
  getPKCE: async (userId: string) => {
    return await MAL.findOne({ user: userId }).select('codeChallenge');
  },
  getToken: async (data: any): Promise<AxiosResponse> => {
    return await axios({
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      data: qs.stringify(data),
      url: `${MALConstants.MAL_AUTH_API}/token`,
    });
  },
  saveToken: async (userId: string, accessToken: string, refreshToken: string, expiresDate: Date) => {
    return await MAL.findOneAndUpdate({ userId }, { accessToken, refreshToken, expiresAt: expiresDate }, { new: true });
  },
  refreshToken: async (userId: string): Promise<Date | null> => {
    const user = await MAL.findOne({ userId }).select('refreshToken expiresAt');
    if (!user || new Date().getTime() <= new Date(user!.expiresAt).getTime()) return null;

    const response: AxiosResponse = await axios({
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      data: qs.stringify({
        client_id: process.env.MAL_CLIENT_ID,
        client_secret: process.env.MAL_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: user?.refreshToken,
      }),
      url: `${MALConstants.MAL_AUTH_API}/token`,
    });

    const { refresh_token, access_token, expires_in } = response.data;

    await MAL.findOneAndUpdate(
      { userId },
      { refreshToken: refresh_token, accessToken: access_token, expiresAt: expireDate(expires_in) },
      { new: true },
    );

    return expireDate(expires_in);
  },
};
export const userApi = {
  getSelf: async (token: string) =>
    await axios.get(`${MALConstants.MAL_API}/users/@me?fields=anime_statistics,time_zone,is_supporter`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  getUser: async (userId: string, token: string) =>
    await axios.get(`${MALConstants.MAL_API}/users/${userId}?fields=anime_statistics,time_zone,is_supporter`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  getMyAnimeList: async (userId: string, params: any) => {
    const user = await MAL.findOne({ userId }).select('accessToken');
    const query = qs.stringify(params);
    return await axios.get(`${MALConstants.MAL_API}/users/@me/animelist?${query}`, {
      headers: { Authorization: `Bearer ${user?.accessToken}` },
    });
  },

  getMyMangaList: async (userId: string, params: any) => {
    const user = await MAL.findOne({ userId }).select('accessToken');
    const query = qs.stringify(params);
    return await axios.get(`${MALConstants.MAL_API}/users/@me/mangalist?${query}`, {
      headers: { Authorization: `Bearer ${user?.accessToken}` },
    });
  },
};
