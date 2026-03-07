import { Body, Controller, Headers, Logger, Post, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppCacheService } from '../../shared/cache';
import { PushLexCookieDto } from './dto/push-cookie.dto';

@ApiTags('internal')
@Controller('internal')
export class InternalApiController {
  private readonly logger = new Logger(InternalApiController.name);
  
  constructor(
    private readonly cacheService: AppCacheService,
    private readonly configService: ConfigService,
  ) {}

  @Post('push-lex-cookie')
  @ApiOperation({ summary: 'Internal webhook to push LEX WAF cookies to cache' })
  async pushLexCookie(
    @Body() body: PushLexCookieDto,
    @Headers('x-internal-secret') authSecret?: string,
  ) {
    const secret = this.configService.get<string>('INTERNAL_API_SECRET');
    
    // Ensure secret is defined and matches
    if (!secret || secret.trim() === '' || authSecret !== secret) {
      this.logger.warn('Failed internal API cookie push due to invalid/missing secret.');
      throw new UnauthorizedException('Invalid internal secret');
    }

    // 3 hours TTL
    const ttlMs = 3 * 60 * 60 * 1000; 
    
    await this.cacheService.set('lex:cookies', body.cookieHeader, ttlMs);
    
    this.logger.log('Successfully saved LEX cookies from internal webhook push');
    return { success: true };
  }
}
