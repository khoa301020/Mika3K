import type { SkillType } from './types/student';

export const SCHALE_GG_BASE = 'https://schale.gg';
export const SCHALE_STUDENT_URL = SCHALE_GG_BASE + '/?chara=';
export const SCHALE_RAID_URL = SCHALE_GG_BASE + '/?raid=';

export const REGIONS: Record<string, number> = {
  JAPAN: 0,
  GLOBAL: 1,
  CHINA: 2,
};

// Regex
export const REGEX_HTML_TAG = /(<([^>]+)>)/gi;
export const REGEX_NUMERIC_PARAMETER = /^\d+(\.\d+)?%?$/g;
export const REGEX_BUFF_REPLACEMENT = /<b:([^>]*)>/g;
export const REGEX_DEBUFF_REPLACEMENT = /<d:([^>]*)>/g;
export const REGEX_CC_REPLACEMENT = /<c:([^>]*)>/g;
export const REGEX_SPECIAL_REPLACEMENT = /<s:([^>]*)>/g;
export const REGEX_PARAMETERS_REPLACEMENT = /<\?([^>]*)>/g;
export const REGEX_GET_ID = /\[(\d+)\]/;

// Stats
export const LEVEL_SCALE = (level: number) => (level - 1) / 99;
export const TRANSCENDENCE: Record<string, number[]> = {
  AttackPower: [0, 1000, 1200, 1400, 1700],
  MaxHP: [0, 500, 700, 900, 1400],
  HealPower: [0, 750, 1000, 1200, 1500],
};

// URLs
export const SCHALE_GG_LOGO =
  'https://raw.githubusercontent.com/lonqie/SchaleDB/main/images/schale.png';
export const SCHALE_GG_ARONA =
  'https://raw.githubusercontent.com/lonqie/SchaleDB/main/images/ui/Image_Char_Arona2.png';
export const SCHALE_STUDENT_PORTRAIT_URL = (id: number) =>
  `https://raw.githubusercontent.com/lonqie/SchaleDB/main/images/student/portrait/${id}.webp`;
export const SCHALE_STUDENT_ICON_URL = (id: number) =>
  `https://raw.githubusercontent.com/lonqie/SchaleDB/main/images/student/icon/${id}.webp`;
export const SCHALE_STUDENT_LOBBY_URL = (id: number) =>
  `https://raw.githubusercontent.com/lonqie/SchaleDB/main/images/student/lobby/${id}.webp`;
export const SCHALE_STUDENT_WEAPON_URL = (weaponImg: string) =>
  `https://raw.githubusercontent.com/lonqie/SchaleDB/main/images/weapon/${weaponImg}.webp`;
export const SCHALE_STUDENT_GEAR_URL = (id: number) =>
  `https://raw.githubusercontent.com/lonqie/SchaleDB/main/images/gear/icon/${id}.webp`;
export const SCHALE_RAID_ICON_URL = (pathName: string, isInsane: boolean) =>
  `https://raw.githubusercontent.com/lonqie/SchaleDB/main/images/raid/icon/Icon_${pathName}${isInsane ? '_Insane' : ''}.png`;
export const SCHALE_RAID_PORTRAIT_URL = (pathName: string, isInsane: boolean) =>
  `https://raw.githubusercontent.com/lonqie/SchaleDB/main/images/raid/Boss_Portrait_${pathName}${isInsane ? '_Insane' : ''}_Lobby.png`;

export const CURRENCY_DATA_URL =
  'https://raw.githubusercontent.com/lonqie/SchaleDB/main/data/en/currency.json';
export const ENEMIES_DATA_URL =
  'https://raw.githubusercontent.com/lonqie/SchaleDB/main/data/en/enemies.json';
export const EQUIPMENT_DATA_URL =
  'https://raw.githubusercontent.com/lonqie/SchaleDB/main/data/en/equipment.json';
export const FURNITURE_DATA_URL =
  'https://raw.githubusercontent.com/lonqie/SchaleDB/main/data/en/furniture.json';
export const ITEMS_DATA_URL =
  'https://raw.githubusercontent.com/lonqie/SchaleDB/main/data/en/items.json';
export const LOCALIZATION_DATA_URL =
  'https://raw.githubusercontent.com/lonqie/SchaleDB/main/data/en/localization.json';
export const RAIDS_DATA_URL =
  'https://raw.githubusercontent.com/lonqie/SchaleDB/main/data/en/raids.json';
export const STUDENTS_DATA_URL =
  'https://raw.githubusercontent.com/lonqie/SchaleDB/main/data/en/students.json';
export const SUMMONS_DATA_URL =
  'https://raw.githubusercontent.com/lonqie/SchaleDB/main/data/en/summons.json';
export const CONFIG_DATA_URL =
  'https://raw.githubusercontent.com/lonqie/SchaleDB/main/data/config.json';

// Icons
export const COMMON_ROLE_ICON: Record<string, string> = {
  DamageDealer:
    'https://github.com/lonqie/SchaleDB/raw/main/images/ui/Role_DamageDealer.png',
  Tanker:
    'https://github.com/lonqie/SchaleDB/raw/main/images/ui/Role_Tanker.png',
  Supporter:
    'https://github.com/lonqie/SchaleDB/raw/main/images/ui/Role_Supporter.png',
  Healer:
    'https://github.com/lonqie/SchaleDB/raw/main/images/ui/Role_Healer.png',
  Vehicle:
    'https://github.com/lonqie/SchaleDB/raw/main/images/ui/Role_Vehicle.png',
};
export const STUDENT_SCHOOL_LOGO: Record<string, string> = {
  Abydos: 'https://schale.gg/images/schoolicon/School_Icon_ABYDOS_W.png',
  Arius: 'https://schale.gg/images/schoolicon/School_Icon_ARIUS_W.png',
  ETC: 'https://schale.gg/images/schoolicon/School_Icon_ETC_W.png',
  Gehenna: 'https://schale.gg/images/schoolicon/School_Icon_GEHENNA_W.png',
  Hyakkiyako:
    'https://schale.gg/images/schoolicon/School_Icon_HYAKKIYAKO_W.png',
  Millennium:
    'https://schale.gg/images/schoolicon/School_Icon_MILLENNIUM_W.png',
  RedWinter: 'https://schale.gg/images/schoolicon/School_Icon_REDWINTER_W.png',
  Shanghaijin:
    'https://schale.gg/images/schoolicon/School_Icon_SHANHAIJING_W.png',
  SRT: 'https://schale.gg/images/schoolicon/School_Icon_SRT_W.png',
  Trinity: 'https://schale.gg/images/schoolicon/School_Icon_TRINITY_W.png',
  Valkyrie: 'https://schale.gg/images/schoolicon/School_Icon_VALKYRIE_W.png',
};

// Student
export const SORT_BY: Record<string, string> = {
  Rarity: 'StarGrade',
  Name: 'Name',
  Height: 'CharHeightMetric',
  ATK_lv1: 'AttackPower1',
  ATK_lvMAX: 'AttackPower100',
  HP_lv1: 'MaxHP1',
  HP_lvMAX: 'MaxHP100',
  DEF_lv1: 'DefensePower1',
  DEF_lvMAX: 'DefensePower100',
  HEAL_lv1: 'HealPower1',
  HEAL_lvMAX: 'HealPower100',
  Dodge: 'DodgePoint',
  Accuracy: 'AccuracyPoint',
  CritRate: 'CriticalPoint',
  CritDamage: 'CritDamageRate',
  Range: 'Range',
  CostRegen: 'RegenCost',
  UrbanAdaptation: 'StreetBattleAdaptation',
  IndoorAdaptation: 'IndoorBattleAdaptation',
  OutdoorAdaptation: 'OutdoorBattleAdaptation',
};
export const STUDENT_RARITY = [1, 2, 3];
export const STUDENT_TYPE: Record<number, string> = {
  0: 'Permanent',
  1: 'Limited',
  2: 'Event',
};
export const STUDENT_MAX_LEVEL = 90;
export const WEAPON_MAX_LEVEL = 50;
export const ARMOR_TYPES = [
  'LightArmor',
  'HeavyArmor',
  'Unarmed',
  'ElasticArmor',
];
export const BULLET_TYPES = ['Explosion', 'Mystic', 'Pierce', 'Sonic'];
export const BULLET_COLOR: Record<string, number> = {
  Explosion: 0xcc1a25,
  Mystic: 0x216f9c,
  Pierce: 0xb26d1f,
  Sonic: 0x9431a5,
};
export const ARMOR_COLOR: Record<string, number> = {
  LightArmor: 0xcc1a25,
  Unarmed: 0x216f9c,
  HeavyArmor: 0xb26d1f,
  ElasticArmor: 0x9431a5,
  Normal: 0x0099ff,
};
export const EQUIPMENT_TYPES: Record<string, string> = {
  Hat: '🎩',
  Hairpin: '🧷',
  Watch: '⌚',
  Shoes: '👟',
  Bag: '👜',
  Charm: '🧧',
  Necklace: '📿',
  Gloves: '🧤',
  Badge: '📛',
};
export const POSITION = ['Back', 'Front', 'Middle'];
export const SCHOOL = [
  'Gehenna',
  'Millennium',
  'Trinity',
  'Abydos',
  'Shanhaijing',
  'Hyakkiyako',
  'RedWinter',
  'Valkyrie',
  'SRT',
  'Arius',
  'Tokiwadai',
  'Sakugawa',
  'ETC',
];
export const SCHOOL_YEAR = ['1st Year', '2nd Year', '3rd Year', 'Suspended'];
export const SQUAD_TYPES = ['Main', 'Support'];
export const TACTIC_ROLE = [
  'DamageDealer',
  'Tanker',
  'Supporter',
  'Healer',
  'Vehicle',
];
export const WEAPON_TYPE = [
  'SR',
  'SG',
  'AR',
  'MG',
  'SMG',
  'HG',
  'GL',
  'MT',
  'RG',
  'RL',
  'FT',
];
export const ADAPTATION_ICON: Record<number, string> = {
  0: '😣',
  1: '😞',
  2: '😐',
  3: '🙂',
  4: '😆',
  5: '😎',
};
export const ADAPTATION_RANK: Record<number, string> = {
  0: 'D',
  1: 'C',
  2: 'B',
  3: 'A',
  4: 'S',
  5: 'SS',
};
export const CC_POWER = 100;
export const CC_RESISTANCE = 100;
export const SKILL_MAP: Record<SkillType, string> = {
  ex: 'EX',
  normal: 'Normal',
  autoattack: 'Auto Attack',
  gearnormal: 'Gear',
  passive: 'Passive',
  weaponpassive: 'Weapon Passive',
  sub: 'Sub',
};

// Raid
export const RAID_LEVEL = [17, 25, 35, 50, 70, 80, 90];
export const RAIDS: Record<string, number> = {
  BINAH: 1,
  CHESED: 2,
  'Shiro & Kuro': 3,
  Hieronymus: 4,
  'KAITEN FX Mk.0': 5,
  Perorodzilla: 6,
  HOD: 7,
  Goz: 8,
  Gregorius: 9,
  Hovercraft: 10,
  Kurokage: 11,
};
export const RAID_DIFFICULTIES: Record<string, number> = {
  Normal: 0,
  Hard: 1,
  VeryHard: 2,
  Hardcore: 3,
  Extreme: 4,
  Insane: 5,
  Torment: 6,
};

// Notify
export const BA_SCHALEDB_UPDATE = 'BA_SCHALEDB_UPDATE';

// Common
export const DEFAULT_EMBED_COLOR = 0x0099ff;
export const BOOLEAN_MAP: Record<string, string> = { true: '✅', false: '❌' };
