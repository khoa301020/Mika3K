import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as qs from 'qs';
import { AppHttpService } from '../../shared/http';
import {
  MATHJS_API,
  SAUCENAO_API,
  CURRENCY_CONVERTER_API,
  REGEX_DOMAIN_NAME_ONLY,
} from './misc.constants';
import type {
  ISaucenaoSearchRequest,
  ISaucenaoSearchResponse,
  ISaucenaoSearchResult,
  ICurrencyQuery,
  IExchangeResult,
} from './misc.types';

@Injectable()
export class MiscService {
  constructor(
    private readonly httpService: AppHttpService,
    private readonly configService: ConfigService,
  ) {}

  // --- Math ---

  async calculateMath(expression: string): Promise<number | null> {
    try {
      const { data } = await this.httpService.get<string>(
        `${MATHJS_API}${encodeURIComponent(expression)}`,
      );
      const result = parseFloat(data);
      return isNaN(result) ? null : result;
    } catch {
      return null;
    }
  }

  // --- Currency ---

  async exchangeCurrency(query: ICurrencyQuery): Promise<IExchangeResult> {
    const apiKey = this.configService.get<string>(
      'CURRENCY_CONVERTER_API_KEY',
    )!;
    const latestQuery = { base: 'EUR', symbols: `${query.from},${query.to}` };
    const url = CURRENCY_CONVERTER_API(apiKey, qs.stringify(latestQuery));

    const { data: res } = await this.httpService.get(url);
    const rate = (1 / res.rates[query.from]) * res.rates[query.to];

    return {
      success: res.success || false,
      query,
      info: { timestamp: res.timestamp, rate },
      date: res.date,
      result: query.amount * rate,
    };
  }

  // --- SauceNAO ---

  async searchSaucenao(imageUrl: string): Promise<ISaucenaoSearchResponse> {
    const request: ISaucenaoSearchRequest = {
      url: imageUrl,
      output_type: 2,
      api_key: this.configService.get<string>('SAUCENAO_API_KEY')!,
      testmode: 1,
      db: 999,
      dedupe: 1,
      hide: 0,
    };

    const { data } = await this.httpService.get(
      `${SAUCENAO_API}?${qs.stringify(request)}`,
    );
    return data as ISaucenaoSearchResponse;
  }

  filterSaucenaoResults(
    data: ISaucenaoSearchResponse,
  ): ISaucenaoSearchResult[] | null {
    if (!data.results || data.results.length === 0) return null;

    const filtered = data.results.filter(
      (r) =>
        parseFloat(r.header?.similarity ?? '0') >
        (data.header?.minimum_similarity ?? 0),
    );

    return filtered.length > 0 ? filtered : null;
  }

  resultsToEmbedFields(
    resultData: any,
  ): Array<{ name: string; value: string }> {
    return Object.entries(resultData).map(([key, value]) => {
      if (Array.isArray(value) && value.every((v) => v == null))
        return { name: key, value: 'N/A' };
      if (value == null || value === '') return { name: key, value: 'N/A' };
      if (Array.isArray(value) && key === 'ext_urls' && value.length > 0) {
        return {
          name: key,
          value: value
            .map(
              (e: string) =>
                `- [${REGEX_DOMAIN_NAME_ONLY.exec(e)?.[1] ?? 'link'}](${e})`,
            )
            .join('\n'),
        };
      }
      if (Array.isArray(value)) return { name: key, value: value.join(', ') };
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      return { name: key, value: String(value) };
    });
  }
}
