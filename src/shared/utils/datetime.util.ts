import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

export type DiscordTimestampType =
  | 'DEFAULT'
  | 'RELATIVE_TIME'
  | 'SHORT_TIME'
  | 'LONG_TIME'
  | 'SHORT_DATE'
  | 'LONG_DATE'
  | 'SHORT_DATETIME'
  | 'LONG_DATETIME';

const TIMESTAMP_FORMATS: Record<DiscordTimestampType, string> = {
  DEFAULT: '',
  RELATIVE_TIME: ':R',
  SHORT_TIME: ':t',
  LONG_TIME: ':T',
  SHORT_DATE: ':d',
  LONG_DATE: ':D',
  SHORT_DATETIME: ':f',
  LONG_DATETIME: ':F',
};

export function getTime(
  datetime: Date | string = new Date(),
  tz = 'Asia/Ho_Chi_Minh',
  format = 'DD/MM/YYYY HH:mm:ss (UTCZ)',
): string {
  return dayjs(datetime).tz(tz).format(format);
}

export function datetimeConverter(timestamp: Date | number | string) {
  const date = new Date(timestamp);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const hour = `${date.getHours() < 10 ? '0' : ''}${date.getHours()}`;
  const minute = `${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`;
  const second = `${date.getSeconds() < 10 ? '0' : ''}${date.getSeconds()}`;

  return {
    date: `${day}/${month}/${year}`,
    time: `${hour}:${minute}:${second}`,
    datetime: `${day}/${month}/${year} ${hour}:${minute}:${second}`,
    studentBirthday: `${month}/${day}`,
  };
}

export function discordTimestamp(
  timestamp: number | string,
  type: DiscordTimestampType = 'DEFAULT',
): string {
  return `<t:${timestamp}${TIMESTAMP_FORMATS[type]}>`;
}

export function getRelativeTime(seconds: number): string {
  if (seconds <= 0) return 'Already reached';
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return [
    d ? `${String(d).padStart(2, '0')}d` : '',
    h ? `${String(h).padStart(2, '0')}h` : '',
    m ? `${String(m).padStart(2, '0')}m` : '',
    s ? `${String(s).padStart(2, '0')}s` : '',
  ]
    .filter(Boolean)
    .join(' ');
}

export function getRelativeTimeBA(
  epochStart: number,
  epochEnd: number,
): string {
  const now = Date.now() / 1000;
  const fromStart = (now - epochStart) * 1000;
  const isRunning = fromStart > 0;
  const diff = isRunning ? (epochEnd - now) * 1000 : Math.abs(fromStart);

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  const timeString = `**${days}d ${hours}h ${minutes}m ${seconds}s**`;

  return isRunning ? `Ends in ${timeString}` : `Starts in ${timeString}`;
}

export function isEnded(epoch: number): boolean {
  return Date.now() / 1000 >= epoch;
}

export function expireDate(expiresInSeconds: number): Date {
  return new Date(Date.now() + expiresInSeconds * 1000);
}

export function convertTZ(date: Date, tzString: string): Date {
  return new Date(
    (typeof date === 'string' ? new Date(date) : date).toLocaleString('en-GB', {
      timeZone: tzString,
    }),
  );
}

export { dayjs };
