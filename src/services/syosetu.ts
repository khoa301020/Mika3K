import axios, { AxiosResponse } from 'axios';
import { SyosetuConstants } from '../constants/index.js';
import Syosetu from '../models/Syosetu.js';
import { IMongooseDocumentNovel, ISyosetuRequest, TFollowTarget } from '../types/syosetu';

export const convertToQuery = (request: ISyosetuRequest): string =>
  Object.entries(request).reduce(
    (acc, [key, value]) => (Array.isArray(value) ? (acc += `${key}=${value.join('-')}&`) : (acc += `${key}=${value}&`)),
    '?',
  );

export const SyosetuAPI = {
  checkNovelExists: async (ncode: string): Promise<[boolean, boolean]> => {
    const request: ISyosetuRequest = { ncode: [ncode], out: 'json', of: ['n', 'gf'], lim: 1 };
    const { data } = await SyosetuAPI.getNovel(request);
    const isExists = data[0].allcount > 0 ? true : false;
    if (!isExists) return [isExists, false];
    const isSaved = (await Syosetu.exists({ ncode })) ? true : false;
    return [isExists, isSaved];
  },
  getNovel: async (request: ISyosetuRequest): Promise<AxiosResponse> =>
    await axios.get(SyosetuConstants.SYOSETU_BASE_URL + convertToQuery(request)),
  saveNovelInfo: async (ncode: string): Promise<IMongooseDocumentNovel | null> => {
    const request: ISyosetuRequest = {
      ncode: [ncode],
      out: 'json',
      of: SyosetuConstants.SYOSETU_METADATA_QUERY_PARAMS,
      lim: 1,
    };
    const { data } = await SyosetuAPI.getNovel(request);
    if (!data || data[0].allcount < 1) throw new Error('❌ Novel not found');
    const metadata = data[1] as IMongooseDocumentNovel['metadata'];
    // Add JST offset to date
    metadata.general_firstup += '+09:00';
    metadata.general_lastup += '+09:00';
    metadata.novelupdated_at += '+09:00';
    return await Syosetu.findOneAndUpdate(
      { ncode },
      { metadata, lastSystemUpdate: Date.now() },
      { upsert: true, new: true },
    );
  },
  followNovel: async (id: string, ncode: string, type: TFollowTarget): Promise<IMongooseDocumentNovel | null> =>
    await Syosetu.findOneAndUpdate({ ncode }, { $addToSet: { [`followings.${type}`]: id } }, { new: true }),
  unfollowNovel: async (id: string, ncode: string, type: TFollowTarget): Promise<IMongooseDocumentNovel | null> =>
    await Syosetu.findOneAndUpdate({ ncode }, { $pull: { [`followings.${type}`]: id } }, { new: true }),
};
