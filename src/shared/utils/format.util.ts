import { ChannelType } from 'discord.js';
import { BaseUserConfig, table } from 'table';

export function formatNumber(num: number): string {
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return num.toString();
}

export function formatString(
  str: string,
  replacements: Array<string | number>,
): string {
  return str.replace(/{(\d+)}/g, (match, number) =>
    replacements[number] !== undefined
      ? replacements[number].toString()
      : match,
  );
}

export function replaceEmpties(
  obj: Record<string, any>,
  replace: string,
  field?: string,
  useHyperlink?: boolean,
): Record<string, any> {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      if (
        Array.isArray(value) &&
        value.every((v) => v === undefined || v === null)
      )
        return [key, replace];
      if (value === undefined || value === null || value === '')
        return [key, replace];
      if (Array.isArray(value) && field && useHyperlink)
        return [key, value.map((e) => `[${e[field]}](${e.url})`).join(', ')];
      if (Array.isArray(value) && field)
        return [key, value.map((e) => e[field]).join(', ')];
      if (Array.isArray(value)) return [key, value.join(', ')];
      return [key, value];
    }),
  );
}

export function tableConverter(
  data: Array<Record<string, any>>,
  columnConfigs: Array<any> = [],
  isHorizontal = true,
): string {
  const config: BaseUserConfig = {
    border: {
      topBody: '─',
      topJoin: '┬',
      topLeft: '┌',
      topRight: '┐',
      bottomBody: '─',
      bottomJoin: '┴',
      bottomLeft: '└',
      bottomRight: '┘',
      bodyLeft: '│',
      bodyRight: '│',
      bodyJoin: '│',
      joinBody: '─',
      joinLeft: '├',
      joinRight: '┤',
      joinJoin: '┼',
    },
    columns: columnConfigs,
  };

  if (isHorizontal) {
    const keys = Object.keys(data[0]);
    const values = data.map((obj) => Object.values(obj));
    return table([keys, ...values], config);
  }
  return table(data as any, config);
}

export function isTextBasedChannel(channel: ChannelType): boolean {
  return [
    ChannelType.GuildText,
    ChannelType.PublicThread,
    ChannelType.PrivateThread,
  ].includes(channel);
}

export function select<T extends object, K extends keyof T>(
  obj: T,
  ...props: K[]
): Pick<T, K> {
  return Object.fromEntries(
    Object.entries(obj).filter(([k]) => props.includes(k as K)),
  ) as Pick<T, K>;
}

export function omit<T extends object, K extends keyof T>(
  obj: T,
  ...props: K[]
): Omit<T, K> {
  return Object.fromEntries(
    Object.entries(obj).filter(([k]) => !props.includes(k as K)),
  ) as Omit<T, K>;
}

export function isObjectEmpty(obj: object): boolean {
  return !obj || Object.keys(obj).length === 0;
}
