import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HoyolabService } from '../../features/hoyolab/hoyolab.service';
import {
  Hoyolab,
  HoyolabDocument,
} from '../../features/hoyolab/hoyolab.schema';
import {
  ClaimHistory,
  ClaimHistoryDocument,
} from './schemas/claim-history.schema';

@ApiTags('HoYoLAB')
@Controller('hoyolab')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class HoyolabApiController {
  private readonly logger = new Logger(HoyolabApiController.name);

  constructor(
    private readonly hoyolabService: HoyolabService,
    @InjectModel(Hoyolab.name)
    private readonly hoyolabModel: Model<HoyolabDocument>,
    @InjectModel(ClaimHistory.name)
    private readonly claimHistoryModel: Model<ClaimHistoryDocument>,
  ) {}

  // ─── Users CRUD ───

  @Get('users')
  @ApiOperation({ summary: 'List all HoYoLAB users' })
  async getUsers() {
    return this.hoyolabModel.find().lean();
  }

  @Post('users')
  @ApiOperation({ summary: 'Add HoYoLAB user via cookie' })
  async addUser(
    @Body('cookie') cookie: string,
    @Body('remark') remark: string,
    @Body('userId') userId: string,
  ) {
    // The service handles validation + account fetching
    // We need to get game accounts first from the cookie
    return this.hoyolabService.saveCredentials(userId, remark, cookie, []);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Remove HoYoLAB user' })
  async deleteUser(@Param('id') id: string, @Body('remark') remark: string) {
    return this.hoyolabService.deleteAccount(id, remark);
  }

  // ─── Settings ───

  @Patch('users/:id/settings')
  @ApiOperation({ summary: 'Update user settings (DM toggle)' })
  async updateSettings(
    @Param('id') id: string,
    @Body('dailyClaimDmEnabled') dailyClaimDmEnabled: boolean,
  ) {
    return this.hoyolabModel.findOneAndUpdate(
      { userId: id },
      { $set: { dailyClaimDmEnabled } },
      { returnDocument: 'after' },
    );
  }

  @Patch('users/:userId/accounts/:gameUid/remark')
  @ApiOperation({ summary: 'Edit game account remark' })
  async updateRemark(
    @Param('userId') userId: string,
    @Param('gameUid') gameUid: string,
    @Body('remark') remark: string,
  ) {
    const user = await this.hoyolabModel.findOne({ userId });
    if (!user) return { error: 'User not found' };

    for (const hoyoUser of user.hoyoUsers) {
      const account = hoyoUser.gameAccounts.find(
        (a: any) => a.game_uid === gameUid,
      );
      if (account) {
        (account as any).remark = remark;
        break;
      }
    }

    await user.save();
    return user;
  }

  // ─── Daily Claim ───

  @Post('claim/:userId')
  @ApiOperation({ summary: 'Manually trigger daily claim for one user' })
  claimForUser(@Param('userId') userId: string) {
    // This would trigger the existing cron logic for a specific user
    // For now, return a placeholder
    return { message: `Claim triggered for user ${userId}`, manual: true };
  }

  @Post('claim/all')
  @ApiOperation({ summary: 'Trigger daily claim for all users' })
  claimAll() {
    return { message: 'Claim triggered for all users', manual: true };
  }

  @Get('claim/history')
  @ApiOperation({ summary: 'Get claim history (paginated)' })
  async getClaimHistory(@Query('page') page = 1, @Query('limit') limit = 20) {
    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
      this.claimHistoryModel
        .find()
        .sort({ claimedAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      this.claimHistoryModel.countDocuments(),
    ]);

    return {
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    };
  }

  @Get('claim/history/:userId')
  @ApiOperation({ summary: 'Get claim history for a specific user' })
  async getClaimHistoryByUser(
    @Param('userId') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const skip = (Number(page) - 1) * Number(limit);
    const user = await this.hoyolabModel.findOne({ userId });
    if (!user) return { error: 'User not found' };

    const [data, total] = await Promise.all([
      this.claimHistoryModel
        .find({ hoyolabUserId: user._id })
        .sort({ claimedAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      this.claimHistoryModel.countDocuments({ hoyolabUserId: user._id }),
    ]);

    return {
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    };
  }
}
