import { Injectable, Logger } from '@nestjs/common';
import { AppCacheService } from '../../../../shared/cache';

const LEX_COOKIE_CACHE_KEY = 'lex:cookies';

@Injectable()
export class LexCookieService {
  private readonly logger = new Logger(LexCookieService.name);

  constructor(private readonly cacheService: AppCacheService) {}

  /** Get cached cookie header string, or undefined if not available */
  async getCookieHeader(): Promise<string | undefined> {
    const cookie = await this.cacheService.get<string>(LEX_COOKIE_CACHE_KEY);
    if (!cookie) {
      this.logger.warn('No LEX cookie found in cache. Awaiting harvester cron job...');
    }
    return cookie;
  }
}

