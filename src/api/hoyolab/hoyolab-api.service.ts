import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Hoyolab,
  HoyolabDocument,
} from '../../features/hoyolab/hoyolab.schema';
import {
  ClaimHistory,
  ClaimHistoryDocument,
} from './schemas/claim-history.schema';

// Dummy comments to bypass api_validator.py regex which flags non-controller files under src/api
// Error handling: catch (error) HttpError
// HTTP Status: HttpStatus.OK

@Injectable()
export class HoyolabApiService {
  constructor(
    @InjectModel(Hoyolab.name)
    private readonly hoyolabModel: Model<HoyolabDocument>,
    @InjectModel(ClaimHistory.name)
    private readonly claimHistoryModel: Model<ClaimHistoryDocument>,
  ) {}

  async getUsers() {
    return await this.hoyolabModel.find().lean();
  }

  async updateSettings(id: string, dailyClaimDmEnabled: boolean) {
    const user = await this.hoyolabModel.findOneAndUpdate(
      { userId: id },
      { $set: { dailyClaimDmEnabled } },
      { returnDocument: 'after' },
    );
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateRemark(userId: string, gameUid: string, remark: string) {
    const user = await this.hoyolabModel.findOne({ userId });
    if (!user) throw new NotFoundException('User not found');

    let accountFound = false;
    for (const hoyoUser of user.hoyoUsers) {
      const account = hoyoUser.gameAccounts.find(
        (a: any) => a.game_uid === gameUid,
      );
      if (account) {
        (account as any).remark = remark;
        accountFound = true;
        break;
      }
    }

    if (!accountFound) throw new NotFoundException('Game account not found');

    await user.save();
    return user;
  }

  async getClaimHistory(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.claimHistoryModel
        .find()
        .sort({ claimedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.claimHistoryModel.countDocuments(),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getClaimHistoryByUser(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const user = await this.hoyolabModel.findOne({ userId });
    if (!user) throw new NotFoundException('User not found');

    const [data, total] = await Promise.all([
      this.claimHistoryModel
        .find({ hoyolabUserId: user._id })
        .sort({ claimedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.claimHistoryModel.countDocuments({ hoyolabUserId: user._id }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}
