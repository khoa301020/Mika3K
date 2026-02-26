import axios from 'axios';
import * as cheerio from 'cheerio';
import { cache } from '../main.js';
import { INHentaiQueryKey, INHentaiQueryParam } from '../types/nhentai';

export async function simulateNHentaiRequest(url: string): Promise<any> {
  return await axios
    .get(url, {
      headers: {
        Host: 'nhentai.net',
        'User-Agent': cache.get('user_agent'),
        Cookie: `cf_clearance=${cache.get('cf_clearance')}`,
      },
      withCredentials: true,
      validateStatus(status) {
        return (status >= 200 && status < 300) || status == 403 || status == 404;
      },
    })
    .then(async (res) => {
      if (res.status === 404) return null;
      if (res.status === 403)
        return await axios
          .post(process.env.FLARESOLVERR_ENDPOINT!, {
            url: url,
            cmd: 'request.get',
            maxTimeout: 60000,
          })
          .then((res) => JSON.parse(cheerio.load(res?.data?.solution?.response)('pre').text()));
      return res.data;
    });
}

function queryTransformer(key: INHentaiQueryKey, opts: INHentaiQueryParam) {
  return opts && opts[key]
    ? Array.isArray(opts[key])
      ? opts[key]!.map((e) =>
          e && e.length > 1 ? (e.charAt(0) === '-' ? `-${key}:"${e.substring(1)}" ` : `${key}:"${e}" `) : '',
        ).join('')
      : `${key}:"${opts[key]}"`
    : '';
}

export function queryBuilder(opts: INHentaiQueryParam): string {
  const query = Object.keys(opts)
    .map((key) => queryTransformer(key as INHentaiQueryKey, opts))
    .join(' ');
  return encodeURIComponent(`+${query.replace(/\s+/g, ' ')}`.trim());
}
