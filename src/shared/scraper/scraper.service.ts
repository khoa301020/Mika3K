import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { AppHttpService } from '../http';

@Injectable()
export class ScraperService {
  constructor(private readonly httpService: AppHttpService) {}

  async load(url: string): Promise<cheerio.CheerioAPI | null> {
    const html = await this.httpService.getHtml(url);
    return html ? cheerio.load(html) : null;
  }

  async getText(url: string, selector: string): Promise<string | null> {
    const $ = await this.load(url);
    if (!$) return null;
    return $(selector).text().trim() || null;
  }
}
