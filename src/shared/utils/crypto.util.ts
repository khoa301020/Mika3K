import { createHash, randomBytes } from 'crypto';

export function generateCodeChallenge(): string {
  return randomBytes(32)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export function md5(input: string): string {
  return createHash('md5').update(input).digest('hex');
}

export function sha1(input: string): string {
  return createHash('sha1').update(input).digest('hex');
}

export function generateDS(): string {
  const salt = '6s25p5ox5y14umn1p61aqyyvbvvl3lrt';
  const time = Math.floor(Date.now() / 1000);
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let random = '';
  for (let i = 0; i < 6; i++)
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  const hash = md5(`salt=${salt}&t=${time}&r=${random}`);
  return `${time},${random},${hash}`;
}
