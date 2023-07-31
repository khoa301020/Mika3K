import axios, { AxiosResponse } from 'axios';
import { INHentaiQueryKey, INHentaiQueryParam } from '../types/nhentai';

export async function simulateNHentaiRequest(url: string): Promise<AxiosResponse> {
  return await axios.get(url);

  // if (process.env.NHENTAI_USE_ORIGIN === 'true')
  //   return await axios.get(
  //     url.replace(
  //       NHentaiConstants.NHENTAI_BASE_API,
  //       process.env.NHENTAI_ORIGIN_API ?? NHentaiConstants.NHENTAI_BASE_API,
  //     ),
  //     {
  //       validateStatus(status) {
  //         return (status >= 200 && status < 300) || status == 403 || status == 404;
  //       },
  //     },
  //   );

  // const jar = new CookieJar();
  // jar.setCookie(process.env.NHENTAI_COOKIE || '', 'https://nhentai.net/');

  // const client = axios.create({
  //   httpAgent: new HttpCookieAgent({ cookies: { jar } }),
  //   httpsAgent: new HttpsCookieAgent({ cookies: { jar } }),
  //   validateStatus(status) {
  //     return (status >= 200 && status < 300) || status == 403 || status == 404;
  //   },
  // });
  // return await client.get(url, {
  //   headers: {
  //     'User-Agent':
  //       process.env.NHENTAI_USER_AGENT ??
  //       'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Edg/115.0.1901.188',
  //   },
  // });
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
