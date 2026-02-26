import {
  Controller,
  Get,
  Param,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GuildsService } from './guilds.service';

@ApiTags('Guilds')
@Controller('guilds')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GuildsController {
  constructor(private readonly guildsService: GuildsService) {}

  @Get()
  @ApiOperation({ summary: 'List all guilds the bot is in' })
  @ApiResponse({ status: 200, description: 'Returns an array of guilds' })
  getGuilds() {
    return this.guildsService.getGuilds();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get guild detail' })
  @ApiResponse({ status: 200, description: 'Returns guild details' })
  @ApiResponse({ status: 404, description: 'Guild not found' })
  getGuild(@Param('id') id: string) {
    const guild = this.guildsService.getGuildByNameOrId(id);
    if (!guild) {
      throw new NotFoundException('Guild not found');
    }
    return guild;
  }
}
