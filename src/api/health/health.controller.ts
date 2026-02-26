import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Bot health status' })
  @ApiResponse({
    status: 200,
    description: 'Returns system and bot health metrics',
  })
  getHealth() {
    return this.healthService.getHealth();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Bot statistics' })
  @ApiResponse({
    status: 200,
    description: 'Returns system statistics (guilds, users, channels)',
  })
  getStats() {
    return this.healthService.getStats();
  }
}
