import { Injectable, Logger } from '@nestjs/common';
import { AppHttpService } from '../../shared/http';
import { AppCacheService } from '../../shared/cache';
import * as cheerio from 'cheerio';

export interface INHentai {
  id: number;
  media_id: string;
  title: {
    english: string;
    japanese: string;
    pretty: string;
  };
  images: {
    pages: Array<any>;
    cover: { t: string; w: number; h: number };
    thumbnail: { t: string; w: number; h: number };
  };
  scanlator: string;
  upload_date: number;
  tags: Array<{
    id: number;
    type: string;
    name: string;
    url: string;
    count: number;
  }>;
  num_pages: number;
  num_favorites: number;
}

@Injectable()
export class NHentaiService {
  private readonly logger = new Logger(NHentaiService.name);

  constructor(
    private readonly httpService: AppHttpService,
    private readonly cacheService: AppCacheService,
  ) {}

  public async getGallery(code: string | number): Promise<INHentai | null> {
    const url = `https://nhentai.net/api/gallery/${code}`;
    try {
      const response = await this.httpService.get(url, {
        headers: {
          Host: 'nhentai.net',
          'User-Agent':
            (await this.cacheService.get<string>('user_agent')) ||
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
          Cookie: `cf_clearance=${(await this.cacheService.get<string>('cf_clearance')) || ''}`,
        },
      });
      return response.data as INHentai;
    } catch (err: any) {
      if (err.response?.status === 404) return null;
      if (err.response?.status === 403) {
        // Fallback to FlareSolverr if configured
        if (process.env.FLARESOLVERR_ENDPOINT) {
          try {
            const flareRes = await this.httpService.post(
              process.env.FLARESOLVERR_ENDPOINT,
              {
                url: url,
                cmd: 'request.get',
                maxTimeout: 60000,
              },
            );
            return JSON.parse(
              cheerio.load(flareRes.data?.solution?.response)('pre').text(),
            ) as INHentai;
          } catch (flareErr) {
            this.logger.error(
              `FlareSolverr failed for nHentai code ${code}`,
              flareErr,
            );
            return null;
          }
        }
      }
      this.logger.error(`Failed to fetch nHentai code ${code}`, err);
      return null;
    }
  }
}
