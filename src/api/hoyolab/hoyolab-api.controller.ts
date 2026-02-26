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
  HttpCode,
  HttpStatus,
  HttpException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { HoyolabService } from '../../features/hoyolab/hoyolab.service';
import { HoyolabApiService } from './hoyolab-api.service';

@ApiTags('HoYoLAB')
@Controller('hoyolab')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class HoyolabApiController {
  private readonly logger = new Logger(HoyolabApiController.name);

  constructor(
    private readonly hoyolabService: HoyolabService,
    private readonly hoyolabApiService: HoyolabApiService,
  ) {}

  // ─── Users CRUD ───

  @Get('users')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all HoYoLAB users' })
  @ApiResponse({ status: 200, description: 'Returns all users' })
  async getUsers() {
    try {
      return await this.hoyolabApiService.getUsers();
    } catch (error) {
      this.logger.error('Failed to get users', error);
      throw new HttpException(
        'Failed to retrieve users',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('users')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add HoYoLAB user via cookie' })
  @ApiResponse({ status: 201, description: 'User successfully added' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async addUser(
    @Body('cookie') cookie: string,
    @Body('remark') remark: string,
    @Body('userId') userId: string,
  ) {
    if (!cookie || !remark || !userId) {
      throw new BadRequestException(
        'Missing required fields (cookie, remark, userId)',
      );
    }
    try {
      return await this.hoyolabService.saveCredentials(
        userId,
        remark,
        cookie,
        [],
      );
    } catch (error) {
      this.logger.error('Failed to add user', error);
      throw new HttpException(
        'Failed to add user based on cookie',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('users/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove HoYoLAB user' })
  @ApiResponse({ status: 200, description: 'User successfully removed' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(@Param('id') id: string, @Body('remark') remark: string) {
    if (!id || !remark)
      throw new BadRequestException('ID and remark are required');
    try {
      return await this.hoyolabService.deleteAccount(id, remark);
    } catch (error: any) {
      this.logger.error('Failed to delete user', error);
      if (error.message.includes('not found')) {
        throw new NotFoundException(error.message);
      }
      throw new HttpException(
        'Failed to delete user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ─── Settings ───

  @Patch('users/:id/settings')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user settings (DM toggle)' })
  @ApiResponse({ status: 200, description: 'Settings successfully updated' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateSettings(
    @Param('id') id: string,
    @Body('dailyClaimDmEnabled') dailyClaimDmEnabled: boolean,
  ) {
    if (typeof dailyClaimDmEnabled !== 'boolean') {
      throw new BadRequestException('dailyClaimDmEnabled must be a boolean');
    }
    try {
      return await this.hoyolabApiService.updateSettings(
        id,
        dailyClaimDmEnabled,
      );
    } catch (error: any) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error('Failed to update settings', error);
      throw new HttpException(
        'Failed to update settings',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('users/:userId/accounts/:gameUid/remark')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Edit game account remark' })
  @ApiResponse({ status: 200, description: 'Remark successfully updated' })
  @ApiResponse({ status: 404, description: 'User or account not found' })
  async updateRemark(
    @Param('userId') userId: string,
    @Param('gameUid') gameUid: string,
    @Body('remark') remark: string,
  ) {
    if (!remark) throw new BadRequestException('Remark is required');
    try {
      return await this.hoyolabApiService.updateRemark(userId, gameUid, remark);
    } catch (error: any) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error('Failed to update remark', error);
      throw new HttpException(
        'Failed to update remark',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ─── Daily Claim ───

  @Post('claim/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Manually trigger daily claim for one user' })
  @ApiResponse({ status: 200, description: 'Claim triggered' })
  claimForUser(@Param('userId') userId: string) {
    try {
      return { message: `Claim triggered for user ${userId}`, manual: true };
    } catch (error) {
      this.logger.error('Failed to trigger claim for user', error);
      throw new HttpException(
        'Failed to start claim',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('claim/all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Trigger daily claim for all users' })
  @ApiResponse({ status: 200, description: 'Global claim triggered' })
  claimAll() {
    try {
      return { message: 'Claim triggered for all users', manual: true };
    } catch (error) {
      this.logger.error('Failed to trigger claim for all users', error);
      throw new HttpException(
        'Failed to start global claim',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('claim/history')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get claim history (paginated)' })
  @ApiResponse({ status: 200, description: 'Returns paginated claim history' })
  async getClaimHistory(@Query('page') page = 1, @Query('limit') limit = 20) {
    try {
      return await this.hoyolabApiService.getClaimHistory(
        Number(page),
        Number(limit),
      );
    } catch (error) {
      this.logger.error('Failed to get claim history', error);
      throw new HttpException(
        'Failed to get claim history',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('claim/history/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get claim history for a specific user' })
  @ApiResponse({ status: 200, description: 'Returns user claim history' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getClaimHistoryByUser(
    @Param('userId') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    try {
      return await this.hoyolabApiService.getClaimHistoryByUser(
        userId,
        Number(page),
        Number(limit),
      );
    } catch (error: any) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error('Failed to get user claim history', error);
      throw new HttpException(
        'Failed to get user claim history',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
