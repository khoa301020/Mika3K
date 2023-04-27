import { randomBytes } from 'crypto';
import QuickChart from 'quickchart-js';
import { BaseUserConfig, table } from 'table';

/**
 * Return a random element from an array.
 * @param array - The array you want to get a random element from.
 * @returns The random element from the array.
 */
export const randomArray = (array: Array<any>) => array[Math.floor(Math.random() * array.length)];

/**
 * It takes a timestamp and returns an object with three properties: date, time, and datetime
 * @param {Date} timestamp - Date - The timestamp you want to convert
 * @returns An object with three properties: date, time, and datetime.
 */
export const datetimeConverter = (timestamp: Date | number | string) => {
  const date = new Date(timestamp);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  return {
    date: `${day}/${month}/${year}`,
    time: `${hour}/${minute}/${second}`,
    datetime: `${day}/${month}/${year} ${hour}:${minute}:${second}`,
    studentBirthday: `${month}/${day}`,
  };
};

/**
 * It takes a timestamp and returns a string that says how long ago that timestamp was
 * @param {Date} timestamp - The timestamp you want to convert to a human readable format.
 * @returns A string that represents the time difference between the current time and the timestamp
 * passed in.
 */
export const timeDiff = (timestamp: Date): String => {
  const now = new Date();
  const date = new Date(timestamp);
  const diff = now.getTime() - date.getTime();
  const diffDays = Math.floor(diff / (1000 * 3600 * 24));
  const diffHours = Math.floor(diff / (1000 * 3600));
  const diffMinutes = Math.floor(diff / (1000 * 60));
  const diffSeconds = Math.floor(diff / 1000);
  if (diffDays > 0) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  if (diffHours > 0) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  if (diffMinutes > 0) return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
  if (diffSeconds > 0) return `${diffSeconds} ${diffSeconds === 1 ? 'second' : 'seconds'} ago`;
  return 'Just now';
};

/**
 * It takes an object, a field, and a replacement string, and returns a new object with all the empty
 * values replaced with the replacement string
 * @param {Object} obj - Object - The object you want to replace the empty values in
 * @param {keyof Object} field - keyof Object - The field you want to replace
 * @param {String} replace - The value to replace the empty values with
 */
export const replaceEmpties = (obj: Object, replace: String, field?: keyof Object, useHyperlink?: Boolean): any =>
  Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      if (Array.isArray(value) && value.every((v) => v === undefined || v === null)) {
        return [key, replace];
      }
      if (value === undefined || value === null || value === '') {
        return [key, replace];
      }
      if (Array.isArray(value) && field && useHyperlink)
        return [key, value.map((e: any) => `[${e[field]}](${e.url})`).join(', ')];
      if (Array.isArray(value) && field) return [key, value.map((e: any) => e[field]).join(', ')];
      if (Array.isArray(value)) return [key, value.map((e: any) => e).join(', ')];

      return [key, value];
    }),
  );

export function splitToChunks<T>(array: T[], chunkSize: number): T[][] {
  const R = [];
  for (let i = 0, len = array.length; i < len; i += chunkSize) R.push(array.slice(i, i + chunkSize));
  return R;
}

export const tableConverter = (
  data: Array<any>,
  columnConfigs: Array<any> = [],
  isHorizontal: boolean = true,
): string => {
  const config = {
    border: {
      topBody: `─`,
      topJoin: `┬`,
      topLeft: `┌`,
      topRight: `┐`,

      bottomBody: `─`,
      bottomJoin: `┴`,
      bottomLeft: `└`,
      bottomRight: `┘`,

      bodyLeft: `│`,
      bodyRight: `│`,
      bodyJoin: `│`,

      joinBody: `─`,
      joinLeft: `├`,
      joinRight: `┤`,
      joinJoin: `┼`,
    },
    columns: columnConfigs,
  };

  if (isHorizontal) {
    const keys = Object.keys(data[0]);
    const values = data.map((obj) => Object.values(obj));
    const result = [keys, ...values];

    return table(result, config as BaseUserConfig);
  } else {
    return table(data, config as BaseUserConfig);
  }
};

export const createChart = (configs: any, width: number, height: number): string =>
  new QuickChart().setConfig(configs).setWidth(width).setHeight(height).getUrl();

export const codeChallenge = randomBytes(32)
  .toString('base64')
  .replace(/=/g, '')
  .replace(/\+/g, '-')
  .replace(/\//g, '_');

export const expireDate = (expires_in_second: number): Date =>
  new Date(new Date().getTime() + expires_in_second * 1000);

export const parseCookies = (cookieStr: string): { [key: string]: string } => {
  const cookies: { [key: string]: string } = {};

  if (cookieStr) {
    const cookiePairs = cookieStr.split(';');

    for (const cookiePair of cookiePairs) {
      const [key, value] = cookiePair.trim().split('=');
      cookies[key] = decodeURIComponent(value);
    }
  }

  return cookies;
};

export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const sortArray = {
  asc: (arr: Array<any>, field: string) =>
    arr?.sort((a, b) => (a[field as keyof Object] > b[field as keyof Object] ? 1 : -1)),
  desc: (arr: Array<any>, field: string) =>
    arr?.sort((a, b) => (a[field as keyof Object] > b[field as keyof Object] ? -1 : 1)),
  ascAlphabet: (arr: Array<any>, field: string) =>
    arr?.sort((a, b) => (a[field as keyof Object] > b[field as keyof Object] ? 1 : 1)),
  descAlphabet: (arr: Array<any>, field: string) =>
    arr?.sort((a, b) => (a[field as keyof Object] > b[field as keyof Object] ? -1 : 1)),
};

export const arrayDiff = (arr1: Array<any>, arr2: Array<any>) =>
  arr1.filter((obj1) => {
    const obj2 = arr2.find((obj2) => obj2.id === obj1.id);
    return JSON.stringify(obj1) !== JSON.stringify(obj2);
  });

export const validateDayMonth = (day: number, month: number): boolean => {
  switch (month) {
    case 1:
    case 3:
    case 5:
    case 7:
    case 8:
    case 10:
    case 12:
      return day > 0 && day <= 31 ? true : false;
    case 4:
    case 6:
    case 9:
    case 11:
      return day > 0 && day <= 30 ? true : false;
    case 2:
      return day > 0 && day <= 29 ? true : false;
    default:
      return false;
  }
};

export const isObjectEmpty = (obj: Object) => {
  return Object.keys(obj).length === 0;
};

export const getRelativeTimeBA = (epochStart: number, epochEnd: number) => {
  const now = new Date().getTime() / 1000;
  const fromStart = (now - epochStart) * 1000;

  const isRunning = fromStart > 0;
  const diff = isRunning ? (epochEnd - now) * 1000 : Math.abs(fromStart);

  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((diff % (60 * 1000)) / 1000);

  const timeString = `**${days}d ${hours}h ${minutes}m ${seconds}s**`;

  return isRunning ? `Ends in ${timeString}` : `Starts in ${timeString}`;
};

export const isEnded = (epoch: number): boolean => new Date().getTime() / 1000 >= epoch;

export function convertTZ(date: Date, tzString: string) {
  return new Date((typeof date === 'string' ? new Date(date) : date).toLocaleString('en-US', { timeZone: tzString }));
}
