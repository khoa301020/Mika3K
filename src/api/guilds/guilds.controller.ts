import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Client, ChannelType } from 'discord.js';

@ApiTags('Guilds')
@Controller('guilds')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GuildsController {
  constructor(private readonly client: Client) {}

  @Get()
  @ApiOperation({ summary: 'List all guilds the bot is in' })
  getGuilds() {
    return this.client.guilds.cache.map((guild) => ({
      id: guild.id,
      name: guild.name,
      icon: guild.iconURL({ size: 128 }),
      memberCount: guild.memberCount,
      ownerId: guild.ownerId,
    }));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get guild detail' })
  getGuild(@Param('id') id: string) {
    const guild = this.client.guilds.cache.get(id);
    if (!guild) return { error: 'Guild not found' };

    const channels = guild.channels.cache
      .filter(
        (ch) =>
          ch.type === ChannelType.GuildText ||
          ch.type === ChannelType.GuildVoice,
      )
      .map((ch) => ({
        id: ch.id,
        name: ch.name,
        type: ch.type === ChannelType.GuildText ? 'text' : 'voice',
        nsfw: 'nsfw' in ch ? ch.nsfw : false,
      }));

    return {
      id: guild.id,
      name: guild.name,
      icon: guild.iconURL({ size: 256 }),
      banner: guild.bannerURL({ size: 512 }),
      memberCount: guild.memberCount,
      ownerId: guild.ownerId,
      premiumTier: guild.premiumTier,
      channels,
    };
  }
}
