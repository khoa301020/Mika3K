import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotifyChannelService, NotifyType } from '../../shared/notify-channel';

@ApiTags('NotifyChannels')
@Controller('notify-channels')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotifyChannelsController {
  constructor(private readonly notifyChannelService: NotifyChannelService) {}

  @Get()
  @ApiOperation({ summary: 'List all enabled notify channels' })
  async getAll() {
    // Access the model directly via the service
    return this.notifyChannelService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Enable feature for a channel' })
  async enable(
    @Body('guildId') guildId: string,
    @Body('channelId') channelId: string,
    @Body('notifyType') notifyType: NotifyType,
  ) {
    return this.notifyChannelService.enableChannel(
      guildId,
      channelId,
      notifyType,
    );
  }

  @Delete(':channelId/:notifyType')
  @ApiOperation({ summary: 'Disable feature for a channel' })
  async disable(
    @Param('channelId') channelId: string,
    @Param('notifyType') notifyType: NotifyType,
  ) {
    await this.notifyChannelService.disableChannel(channelId, notifyType);
    return { message: 'Disabled' };
  }
}
