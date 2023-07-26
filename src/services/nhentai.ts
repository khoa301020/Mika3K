import axios from 'axios';
import { INHentaiQueryKey, INHentaiQueryParam } from '../types/nhentai';

import { HttpCookieAgent, HttpsCookieAgent } from 'http-cookie-agent/http';
import { CookieJar } from 'tough-cookie';

const jar = new CookieJar();
jar.setCookie(process.env.NHENTAI_COOKIE || '', 'https://nhentai.net/');

const client = axios.create({
  httpAgent: new HttpCookieAgent({ cookies: { jar } }),
  httpsAgent: new HttpsCookieAgent({ cookies: { jar } }),
});

export async function simulateNHentaiRequest(url: string) {
  return await client.get(url, {
    headers: {
      'User-Agent': process.env.NHENTAI_USER_AGENT ?? 'Mika3K/1.0.0',
    },
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
  return encodeURIComponent(query.replace(/\s+/g, ' ').trim());
}
