import CommonConstants from './common.js';

export default class BlueArchiveConstants {
  public static readonly SCHALE_GG_BASE = 'https://schale.gg';
  public static readonly SCHALE_STUDENT_URL = this.SCHALE_GG_BASE + '/?chara=';
  public static readonly SCHALE_RAID_URL = this.SCHALE_GG_BASE + '/?raid=';
  public static readonly REGIONS: { [key: string]: number } = {
    JP: 0,
    GLOBAL: 1,
  };

  /* Regex */

  public static readonly REGEX_NUMERIC_PARAMETER: RegExp = /^\d+(\.\d+)?%?$/g;
  public static readonly REGEX_BUFF_REPLACEMENT: RegExp = /<b:([^>]*)>/g;
  public static readonly REGEX_DEBUFF_REPLACEMENT: RegExp = /<d:([^>]*)>/g;
  public static readonly REGEX_CC_REPLACEMENT: RegExp = /<c:([^>]*)>/g;
  public static readonly REGEX_SPECIAL_REPLACEMENT: RegExp = /<s:([^>]*)>/g;
  public static readonly REGEX_PARAMETERS_REPLACEMENT: RegExp = /<\?([^>]*)>/g;

  /* Stats */
  public static readonly LEVEL_SCALE = (level: number) => (level - 1) / 99;

  public static readonly TRANSCENDENCE: { [key: string]: Array<number> } = {
    AttackPower: [0, 1000, 1200, 1400, 1700],
    MaxHP: [0, 500, 700, 900, 1400],
    HealPower: [0, 750, 1000, 1200, 1500],
  };

  /* Data urls */

  public static readonly SCHALE_GG_LOGO = 'https://raw.githubusercontent.com/lonqie/SchaleDB/main/images/schale.png';
  public static readonly SCHALE_GG_ARONA =
    'https://raw.githubusercontent.com/lonqie/SchaleDB/main/images/ui/Image_Char_Arona2.png';
  public static readonly SCHALE_STUDENT_PORTRAIT_URL =
    'https://raw.githubusercontent.com/lonqie/SchaleDB/main/images/student/portrait/';
  public static readonly SCHALE_STUDENT_ICON_URL =
    'https://raw.githubusercontent.com/lonqie/SchaleDB/main/images/student/icon/';
  public static readonly SCHALE_STUDENT_WEAPON_URL =
    'https://raw.githubusercontent.com/lonqie/SchaleDB/main/images/weapon/';
  public static readonly SCHALE_STUDENT_GEAR_URL =
    'https://raw.githubusercontent.com/lonqie/SchaleDB/main/images/gear/';
  public static readonly SCHALE_STUDENT_LOBBY_URL = (devName: string) =>
    `https://raw.githubusercontent.com/lonqie/SchaleDB/main/images/student/lobby/Lobbyillust_Icon_${devName}_01.png`;
  public static readonly SCHALE_RAID_ICON_URL = (pathName: string, isFromInsane: boolean) =>
    `https://raw.githubusercontent.com/lonqie/SchaleDB/main/images/raid/icon/Icon_${pathName}${
      isFromInsane ? '_Insane' : ''
    }.png`;
  public static readonly SCHALE_RAID_PORTRAIT_URL = (pathName: string, isFromInsane: boolean) =>
    `https://raw.githubusercontent.com/lonqie/SchaleDB/main/images/raid/Boss_Portrait_${pathName}${
      isFromInsane ? '_Insane' : ''
    }_Lobby.png`;
  public static readonly CURRENCY_DATA_URL =
    'https://raw.githubusercontent.com/lonqie/SchaleDB/main/data/en/currency.json';
  public static readonly ENEMIES_DATA_URL =
    'https://raw.githubusercontent.com/lonqie/SchaleDB/main/data/en/enemies.json';
  public static readonly EQUIPMENT_DATA_URL =
    'https://raw.githubusercontent.com/lonqie/SchaleDB/main/data/en/equipment.json';
  public static readonly FURNITURE_DATA_URL =
    'https://raw.githubusercontent.com/lonqie/SchaleDB/main/data/en/furniture.json';
  public static readonly ITEMS_DATA_URL = 'https://raw.githubusercontent.com/lonqie/SchaleDB/main/data/en/items.json';
  public static readonly LOCALIZATION_DATA_URL =
    'https://raw.githubusercontent.com/lonqie/SchaleDB/main/data/en/localization.json';
  public static readonly RAIDS_DATA_URL = 'https://raw.githubusercontent.com/lonqie/SchaleDB/main/data/en/raids.json';
  public static readonly STUDENTS_DATA_URL =
    'https://raw.githubusercontent.com/lonqie/SchaleDB/main/data/en/students.json';
  public static readonly SUMMONS_DATA_URL =
    'https://raw.githubusercontent.com/lonqie/SchaleDB/main/data/en/summons.json';
  public static readonly COMMON_DATA_URL = 'https://raw.githubusercontent.com/lonqie/SchaleDB/main/data/common.json';

  /* Icon urls */

  public static readonly COMMON_WEAPON_ICON =
    'https://raw.githubusercontent.com/lonqie/SchaleDB/main/images/ui/Common_Icon_CharacterWeapon_off.png';
  public static readonly COMMON_ROLE_ICON: { [key: string]: string } = {
    DamageDealer: 'https://github.com/lonqie/SchaleDB/raw/main/images/ui/Role_DamageDealer.png',
    Tanker: 'https://github.com/lonqie/SchaleDB/raw/main/images/ui/Role_Tanker.png',
    Supporter: 'https://github.com/lonqie/SchaleDB/raw/main/images/ui/Role_Supporter.png',
    Healer: 'https://github.com/lonqie/SchaleDB/raw/main/images/ui/Role_Healer.png',
    Vehicle: 'https://github.com/lonqie/SchaleDB/raw/main/images/ui/Role_Vehicle.png',
  };

  public static readonly STUDENT_SCHOOL_LOGO: { [key: string]: string } = {
    Abydos: 'https://schale.gg/images/schoolicon/School_Icon_ABYDOS_W.png',
    Arius: 'https://schale.gg/images/schoolicon/School_Icon_ARIUS_W.png',
    ETC: 'https://schale.gg/images/schoolicon/School_Icon_ETC_W.png',
    Gehenna: 'https://schale.gg/images/schoolicon/School_Icon_GEHENNA_W.png',
    Hyakkiyako: 'https://schale.gg/images/schoolicon/School_Icon_HYAKKIYAKO_W.png',
    Millennium: 'https://schale.gg/images/schoolicon/School_Icon_MILLENNIUM_W.png',
    RedWinter: 'https://schale.gg/images/schoolicon/School_Icon_REDWINTER_W.png',
    Shanghaijin: 'https://schale.gg/images/schoolicon/School_Icon_SHANHAIJING_W.png',
    SRT: 'https://schale.gg/images/schoolicon/School_Icon_SRT_W.png',
    Trinity: 'https://schale.gg/images/schoolicon/School_Icon_TRINITY_W.png',
    Valkyrie: 'https://schale.gg/images/schoolicon/School_Icon_VALKYRIE_W.png',
  };

  /* Student constants */

  public static readonly SORT_BY: { [key: string]: string } = {
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
  public static readonly STUDENT_RARITY = [1, 2, 3];
  public static readonly STUDENT_TYPE: { [key: number]: string } = {
    0: 'Permanent',
    1: 'Limited',
    2: 'Event',
  };
  public static readonly STUDENT_MAX_LEVEL = 87;
  public static readonly ARMOR_TYPES = ['LightArmor', 'HeavyArmor', 'Unarmed', 'ElasticArmor'];
  public static readonly BULLET_TYPES = ['Explosion', 'Mystic', 'Pierce', 'Sonic'];
  public static readonly BULLET_COLOR: { [key: string]: number } = {
    Explosion: 0xcc1a25,
    Mystic: 0x216f9c,
    Pierce: 0xb26d1f,
    Sonic: 0x9431a5,
  };
  public static readonly ARMOR_COLOR: { [key: string]: number } = {
    LightArmor: 0xcc1a25,
    Unarmed: 0x216f9c,
    HeavyArmor: 0xb26d1f,
    ElasticArmor: 0x9431a5,
    Normal: CommonConstants.DEFAULT_EMBED_COLOR,
  };
  public static readonly STUDENT_AGE = [
    '11 years old',
    '15 years old',
    '16 years old',
    '17 years old',
    '18 years old',
    'Top Secret',
    'Age Unknown',
    '?? years old',
  ];
  public static readonly EQUIPMENT_TYPES: { [key: string]: string } = {
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
  public static readonly FAVOR_STAT_TYPES = ['AttackPower', 'MaxHP', 'DefensePower', 'HealPower', 'CriticalPoint'];
  public static readonly POSITION = ['Back', 'Front', 'Middle'];
  public static readonly SCHOOL = [
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
    'ETC',
  ];
  public static readonly SCHOOL_YEAR = ['1st Year', '2nd Year', '3rd Year', 'Suspended'];
  public static readonly SQUAD_TYPES = ['Main', 'Support'];
  public static readonly TACTIC_ROLE = ['DamageDealer', 'Tanker', 'Supporter', 'Healer', 'Vehicle'];
  public static readonly ADAPTATION_TYPE = ['Street', 'Outdoor', 'Indoor'];
  public static readonly ADAPTATION_ICON: { [key: number]: string } = {
    0: '😣',
    1: '😞',
    2: '😐',
    3: '🙂',
    4: '😆',
    5: '😎',
  };
  public static readonly ADAPTATION_RANK: { [key: number]: string } = {
    0: 'D',
    1: 'C',
    2: 'B',
    3: 'A',
    4: 'S',
    5: 'SS',
  };
  public static readonly WEAPON_TYPE = ['SR', 'SG', 'AR', 'MG', 'SMG', 'HG', 'GL', 'MT', 'RG', 'RL', 'FT'];
  public static readonly WEAPON_MAX_LEVEL = 50;
  public static readonly CC_POWER = 100;
  public static readonly CC_RESISTANCE = 100;
  public static readonly CRIT_RESISTANCE = 100;
  public static readonly CRIT_DMG_RESISTANCE = 50;

  /* Raid constants */

  public static readonly RAID_LEVEL = [17, 25, 35, 50, 70, 80, 90];

  public static readonly RAIDS: { [key: string]: number } = {
    Binah: 1,
    Chesed: 2,
    ShiroKuro: 3,
    Hieronymus: 4,
    KAITEN: 5,
    Perorodzilla: 6,
    HOD: 7,
    Goz: 8,
    Gregorius: 9,
    HoverCraft: 10,
  };

  public static readonly RAID_DIFFICULTIES: { [key: string]: number } = {
    Normal: 0,
    Hard: 1,
    VeryHard: 2,
    Hardcore: 3,
    Extreme: 4,
    Insane: 5,
    Torment: 6,
  };
}
