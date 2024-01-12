import axios from 'axios';
import * as cheerio from 'cheerio';
import { CommonConstants } from '../constants/index.js';
import { cache } from '../main.js';
import { INHentaiQueryKey, INHentaiQueryParam } from '../types/nhentai';

export async function simulateNHentaiRequest(url: string): Promise<any> {
  return await axios.get(url, {
    headers: {
      "Host": "nhentai.net",
      'User-Agent': cache.get('user_agent'),
      'Cookie': `cf_clearance=${cache.get('cf_clearance')}`,
    },
    withCredentials: true,
    validateStatus(status) {
      return (status >= 200 && status < 300)
        || status == 403 || status == 404;
    },
  }).then(async (res) => {
    if (res.status === 404) return null;
    if (res.status === 403) return await axios.post(process.env.FLARESOLVERR_ENDPOINT!, {
      url: url,
      cmd: "request.get",
      maxTimeout: 60000
    }).then((res) => JSON.parse(cheerio.load(res?.data?.solution?.response)('pre').text()));
    return res.data;
  });
}

function queryTransformer(key: INHentaiQueryKey, opts: INHentaiQueryParam) {
  return opts && opts[key]
    ? Array.isArray(opts[key])
      ? opts[key]!.map((e) =>
        e && e.length > 1
          ? (e.charAt(0) === '-'
            ? `-${key}:"${e.substring(1)}" `
            : `${key}:"${e}" `)
          : '',
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

function setDefaultCloudflareCookie() {
  cache.set('cf_clearance', process.env.NHENTAI_COOKIE ?? '', 60 * 60 * 24);
  cache.set('user_agent', process.env.NHENTAI_USER_AGENT ?? CommonConstants.USER_AGENT, 60 * 60 * 24);
}

export async function setCloudflareCookie(): Promise<void> {
  if (process.env.BOT_ENV !== 'production') return setDefaultCloudflareCookie();

  const { data } = await axios.post(process.env.FLARESOLVERR_ENDPOINT!, {
    cmd: "request.get",
    url: "http://nhentai.net/api/gallery/177013",
    maxTimeout: 60000
  });

  if (!data || !data.solution?.cookies?.find((e: any) => e.name === 'cf_clearance')) return setDefaultCloudflareCookie();

  cache.set('cf_clearance', data.solution.cookies.find((e: any) => e.name === 'cf_clearance')?.value ?? '', 60 * 60 * 24);
  cache.set('user_agent', data.solution.userAgent ?? CommonConstants.USER_AGENT, 60 * 60 * 24);
}
