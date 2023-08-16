import axios, { AxiosResponse } from 'axios';
import { SyosetuConstants } from '../constants/index.js';
import Syosetu from '../models/Syosetu.js';
import {
  IMongooseDocumentNovel,
  ISyosetuMetadataFields,
  ISyosetuRequest,
  ISyosetuResponseMeta,
  TFollowTarget,
} from '../types/syosetu';

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
  saveNovelInfo: async (ncodes: Array<string>): Promise<unknown> => {
    const request: ISyosetuRequest = {
      ncode: ncodes,
      out: 'json',
      of: SyosetuConstants.SYOSETU_METADATA_QUERY_PARAMS,
      lim: ncodes.length,
    };

    const { data }: { data: Array<ISyosetuResponseMeta | ISyosetuMetadataFields> } = await SyosetuAPI.getNovel(request);

    if (!data || (data[0] as ISyosetuResponseMeta).allcount < 1) throw new Error('❌ Novel not found');
    const novelMetadatas = data.slice(1) as Array<ISyosetuMetadataFields>;

    return await Syosetu.bulkWrite(
      novelMetadatas.map((metadata: ISyosetuMetadataFields) => ({
        updateOne: {
          filter: { ncode: metadata.ncode.toLowerCase() },
          update: {
            $set: {
              metadata: Object.assign(metadata, {
                // Add JST offset to date
                general_firstup: (metadata.general_firstup += '+09:00'),
                general_lastup: (metadata.general_lastup += '+09:00'),
                novelupdated_at: (metadata.novelupdated_at += '+09:00'),
              }),
              lastSystemUpdate: new Date(),
            },
          },
          upsert: true,
        },
      })),
    );
  },

  followNovel: async (id: string, ncode: string, type: TFollowTarget): Promise<IMongooseDocumentNovel | null> =>
    await Syosetu.findOneAndUpdate({ ncode }, { $addToSet: { [`followings.${type}`]: id } }, { new: true }),
  unfollowNovel: async (id: string, ncode: string, type: TFollowTarget): Promise<IMongooseDocumentNovel | null> =>
    await Syosetu.findOneAndUpdate({ ncode }, { $pull: { [`followings.${type}`]: id } }, { new: true }),
};
