import axios from 'axios';
import { Constants } from '../constants/constants.js';

export const animeApi = {
  search: (queryString: string) => axios.get(`${Constants.JIKAN_ANIME_SEARCH}?${queryString}`),
  genres: (queryString: string) => axios.get(`${Constants.JIKAN_GENRES_ANIME}?${queryString}`),
};

export const mangaApi = {
  search: (queryString: string) => axios.get(`${Constants.JIKAN_MANGA_SEARCH}?${queryString}`),
  genres: (queryString: string) => axios.get(`${Constants.JIKAN_GENRES_MANGA}?${queryString}`),
};

export const characterApi = {
  search: (queryString: string) => axios.get(`${Constants.JIKAN_CHARACTER_SEARCH}?${queryString}`),
};

export const peopleApi = {
  search: (queryString: string) => axios.get(`${Constants.JIKAN_PEOPLE_SEARCH}?${queryString}`),
};
