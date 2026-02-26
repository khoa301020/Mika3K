import { Injectable } from '@nestjs/common';
import { Client, ChannelType } from 'discord.js';

@Injectable()
export class GuildsService {
  constructor(private readonly client: Client) {}

  getGuilds() {
    return this.client.guilds.cache.map((guild) => ({
      id: guild.id,
      name: guild.name,
      icon: guild.iconURL({ size: 128 }),
      memberCount: guild.memberCount,
      ownerId: guild.ownerId,
    }));
  }

  getGuildByNameOrId(id: string) {
    const guild = this.client.guilds.cache.get(id);
    if (!guild) return null;

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
