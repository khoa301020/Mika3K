import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppHttpService } from '../../shared/http';
import { Syosetu, SyosetuDocument } from './syosetu.schema';
import { SyosetuConstants } from './syosetu.constants';
import {
  ISyosetuRequest,
  ISyosetuResponseMeta,
  ISyosetuMetadataFields,
  TFollowTarget,
} from './types';

@Injectable()
export class SyosetuService {
  private readonly logger = new Logger(SyosetuService.name);

  constructor(
    @InjectModel(Syosetu.name)
    private readonly syosetuModel: Model<SyosetuDocument>,
    private readonly httpService: AppHttpService,
  ) {}

  private convertToQuery(request: ISyosetuRequest): string {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(request)) {
      if (Array.isArray(value)) {
        params.append(key, value.join('-'));
      } else {
        params.append(key, String(value));
      }
    }
    return `?${params.toString()}`;
  }

  async getNovel(request: ISyosetuRequest): Promise<any> {
    const url =
      SyosetuConstants.SYOSETU_BASE_URL + this.convertToQuery(request);
    const response = await this.httpService.get(url);
    return response.data;
  }

  async checkNovelExists(ncode: string): Promise<[boolean, boolean]> {
    const request: ISyosetuRequest = {
      ncode: [ncode],
      out: 'json',
      of: ['n', 'gf'],
      lim: 1,
    };
    const data = await this.getNovel(request);
    const isExists = data[0].allcount > 0;
    if (!isExists) return [false, false];
    const isSaved = !!(await this.syosetuModel.exists({ ncode }));
    return [true, isSaved];
  }

  async saveNovelInfo(ncodes: Array<string>): Promise<unknown> {
    const request: ISyosetuRequest = {
      ncode: ncodes,
      out: 'json',
      of: SyosetuConstants.SYOSETU_METADATA_QUERY_PARAMS,
      lim: ncodes.length,
    };

    const data: Array<ISyosetuResponseMeta | ISyosetuMetadataFields> =
      await this.getNovel(request);

    if (!data || (data[0] as ISyosetuResponseMeta).allcount < 1) {
      throw new Error('Novel not found');
    }

    const novelMetadatas = data.slice(1) as Array<ISyosetuMetadataFields>;

    return await this.syosetuModel.bulkWrite(
      novelMetadatas.map((metadata: ISyosetuMetadataFields) => ({
        updateOne: {
          filter: { ncode: metadata.ncode.toLowerCase() },
          update: {
            $set: {
              metadata: Object.assign(metadata, {
                general_firstup: (metadata.general_firstup += '+09:00'),
                general_lastup: (metadata.general_lastup += '+09:00'),
                novelupdated_at: (metadata.novelupdated_at += '+09:00'),
              }),
              lastSystemUpdate: new Date(),
            },
          },
          upsert: true,
        },
      })) as any,
    );
  }

  async followNovel(
    id: string,
    ncode: string,
    type: TFollowTarget,
  ): Promise<SyosetuDocument | null> {
    return await this.syosetuModel.findOneAndUpdate(
      { ncode },
      { $addToSet: { [`followings.${type}`]: id } },
      { returnDocument: 'after' },
    );
  }

  async unfollowNovel(
    id: string,
    ncode: string,
    type: TFollowTarget,
  ): Promise<SyosetuDocument | null> {
    return await this.syosetuModel.findOneAndUpdate(
      { ncode },
      { $pull: { [`followings.${type}`]: id } },
      { returnDocument: 'after' },
    );
  }

  async getAllNovels(): Promise<SyosetuDocument[]> {
    return await this.syosetuModel.find({});
  }
}
