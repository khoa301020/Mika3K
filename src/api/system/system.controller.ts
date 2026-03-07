import {
    Body,
    Controller,
    Headers,
    HttpCode,
    HttpStatus,
    Logger,
    Post,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppCacheService } from '../../shared/cache';

import { IsDefined, IsNumber, IsOptional, IsString } from 'class-validator';

class CacheWebhookDto {
  @IsString()
  @IsDefined()
  cacheKey: string;

  @IsDefined()
  cacheValue: any;

  @IsNumber()
  @IsOptional()
  /** TTL in milliseconds. Defaults to 0 (no expiration). */
  ttl?: number;
}

@ApiTags('System')
@Controller('system')
export class SystemController {
  private readonly logger = new Logger(SystemController.name);

  constructor(
    private readonly cacheService: AppCacheService,
    private readonly configService: ConfigService,
  ) {}

  @Post('webhook/cache')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Dynamic cache webhook',
    description:
      'Receives a cache key/value pair from external runners (e.g. GitHub Actions) and stores it in the global AppCacheService.',
  })
  @ApiHeader({ name: 'x-system-token', required: true })
  @ApiResponse({ status: 200, description: 'Cache updated successfully' })
  @ApiResponse({ status: 401, description: 'Invalid or missing system token' })
  async setCacheEntry(
    @Headers('x-system-token') token: string,
    @Body() body: CacheWebhookDto,
  ) {
    const expectedToken = this.configService.get<string>('SYSTEM_SECRET_TOKEN');
    if (!token || token !== expectedToken) {
      throw new UnauthorizedException('Invalid system token');
    }

    const { cacheKey, cacheValue, ttl } = body;
    if (!cacheKey) {
      return { success: false, message: 'Missing cacheKey' };
    }

    await this.cacheService.set(cacheKey, cacheValue, ttl ?? 0);
    this.logger.log(`[Webhook] Cache updated: key="${cacheKey}", ttl=${ttl ?? 0}ms`);

    return { success: true, key: cacheKey };
  }
}
