import axios, { AxiosResponse } from 'axios';
import { CommonConstants } from '../constants/index.js';
import { INHentaiQueryKey, INHentaiQueryParam } from '../types/nhentai';

export async function simulateNHentaiRequest(url: string): Promise<AxiosResponse> {
  return await axios.get(url, {
    headers: {
      "Host": "nhentai.net",
      'User-Agent': process.env.NHENTAI_USER_AGENT || CommonConstants.USER_AGENT,
      'Cookie': process.env.NHENTAI_COOKIE || '',
    },
    withCredentials: true,
    validateStatus(status) {
      return (status >= 200 && status < 300) || status == 404;
    },
  })
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
