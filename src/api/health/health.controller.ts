import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Client } from 'discord.js';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';

@ApiTags('Health')
@Controller('health')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class HealthController {
  constructor(
    private readonly client: Client,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Bot health status' })
  getHealth() {
    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);

    return {
      status: 'ok',
      uptime: `${days}d ${hours}h ${minutes}m`,
      uptimeSeconds: Math.floor(uptime),
      memory: {
        used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
        total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
        rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
      },
      mongodb: {
        status: this.connection.readyState === 1 ? 'connected' : 'disconnected',
        host: this.connection.host,
        name: this.connection.name,
      },
      discord: {
        status: this.client.isReady() ? 'ready' : 'not ready',
        latency: `${this.client.ws.ping}ms`,
        user: this.client.user?.tag,
      },
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Bot statistics' })
  getStats() {
    return {
      guilds: this.client.guilds.cache.size,
      users: this.client.users.cache.size,
      channels: this.client.channels.cache.size,
    };
  }
}
