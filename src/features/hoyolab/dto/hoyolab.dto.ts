import type { THoyoGame } from '../types/hoyolab';
import { StringOption } from 'necord';

export class HoyolabSaveTokenDto {
  @StringOption({
    name: 'remark',
    description: 'Remark for this HoYoLAB user (max 20 characters)',
    required: true,
    max_length: 20,
  })
  remark: string;

  @StringOption({
    name: 'cookie',
    description: 'Cookie token string',
    required: true,
  })
  cookie: string;
}

export class HoyolabNoteDto {
  @StringOption({
    name: 'target-game',
    description: 'Target game',
    required: true,
    choices: [
      { name: 'Genshin Impact', value: 'genshin' },
      { name: 'Honkai Star Rail', value: 'hsr' },
    ],
  })
  target: Exclude<THoyoGame, 'hi3'>;
}

export class HoyolabRedeemDto {
  @StringOption({
    name: 'target-game',
    description: 'Target game',
    required: true,
    choices: [
      { name: 'Genshin Impact', value: 'genshin' },
      { name: 'Honkai Star Rail', value: 'hsr' },
    ],
  })
  target: THoyoGame;

  @StringOption({
    name: 'giftcode1',
    description: 'Giftcode 1 (compulsory)',
    required: true,
  })
  giftcode1: string;

  @StringOption({
    name: 'giftcode2',
    description: 'Giftcode 2 (optional)',
    required: false,
  })
  giftcode2?: string;

  @StringOption({
    name: 'giftcode3',
    description: 'Giftcode 3 (optional)',
    required: false,
  })
  giftcode3?: string;

  @StringOption({
    name: 'giftcode4',
    description: 'Giftcode 4 (optional)',
    required: false,
  })
  giftcode4?: string;

  @StringOption({
    name: 'giftcode5',
    description: 'Giftcode 5 (optional)',
    required: false,
  })
  giftcode5?: string;

  @StringOption({
    name: 'giftcode6',
    description: 'Giftcode 6 (optional)',
    required: false,
  })
  giftcode6?: string;

  @StringOption({
    name: 'giftcode7',
    description: 'Giftcode 7 (optional)',
    required: false,
  })
  giftcode7?: string;

  @StringOption({
    name: 'giftcode8',
    description: 'Giftcode 8 (optional)',
    required: false,
  })
  giftcode8?: string;

  @StringOption({
    name: 'giftcode9',
    description: 'Giftcode 9 (optional)',
    required: false,
  })
  giftcode9?: string;

  @StringOption({
    name: 'giftcode10',
    description: 'Giftcode 10 (optional)',
    required: false,
  })
  giftcode10?: string;
}

export class HoyolabDeleteRemarkDto {
  @StringOption({
    name: 'remark',
    description:
      'Remarks of the account (use `/hoyolab info` to see info containing remarks)',
    required: true,
  })
  remark: string;
}
