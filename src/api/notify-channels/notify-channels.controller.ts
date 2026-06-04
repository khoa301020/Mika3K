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
import { NotifyType } from '../../shared/notify-channel/notify-channel.enum';
import { NotifyChannelService } from '../../shared/notify-channel/notify-channel.service';

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
    @Body('notifyType') notifyType: string,
  ) {
    return this.notifyChannelService.enableChannel(
      guildId,
      channelId,
      notifyType as NotifyType,
    );
  }

  @Delete(':channelId/:notifyType')
  @ApiOperation({ summary: 'Disable feature for a channel' })
  async disable(
    @Param('channelId') channelId: string,
    @Param('notifyType') notifyType: string,
  ) {
    await this.notifyChannelService.disableChannel(channelId, notifyType as NotifyType);
    return { message: 'Disabled' };
  }
}
