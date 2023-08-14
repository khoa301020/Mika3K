import axios, { AxiosResponse } from 'axios';
import { HttpsCookieAgent } from 'http-cookie-agent/http';
import { CookieJar } from 'tough-cookie';
import { CommonConstants, NHentaiConstants } from '../constants/index.js';
import { INHentaiQueryKey, INHentaiQueryParam } from '../types/nhentai';

export async function simulateNHentaiRequest(url: string): Promise<AxiosResponse> {
  // return await axios.get(url);

  if (process.env.NHENTAI_USE_ORIGIN === 'true')
    return await axios.get(
      url.replace(
        NHentaiConstants.NHENTAI_BASE_API,
        process.env.NHENTAI_ORIGIN_API ?? NHentaiConstants.NHENTAI_BASE_API,
      ),
      {
        validateStatus(status) {
          return (status >= 200 && status < 300) || status == 404;
        },
      },
    );

  const jar = new CookieJar();
  jar.setCookie(process.env.NHENTAI_COOKIE || '', 'https://nhentai.net/');

  return await axios.get(url, {
    httpsAgent: new HttpsCookieAgent({ cookies: { jar } }),
    headers: {
      'User-Agent': process.env.USER_AGENT || CommonConstants.USER_AGENT,
    },
    validateStatus(status) {
      return (status >= 200 && status < 300) || status == 404;
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
