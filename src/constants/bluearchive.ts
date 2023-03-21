export class BlueArchiveConstants {
  public static readonly SCHALE_GG_LOGO = 'https://schale.gg/images/schale.png';
  public static readonly SCHALE_GG_BASE = 'https://schale.gg';
  public static readonly SCHALE_IMAGE_STUDENT_URL = this.SCHALE_GG_BASE + '/images/student/portrait/';
  public static readonly SCHALE_STUDENT_URL = this.SCHALE_GG_BASE + '/?chara=';
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

  /* Student constants */

  public static readonly STUDENT_RARITY = [1, 2, 3];
  public static readonly STUDENT_TYPE: { [key: number]: string } = {
    0: 'Non-limit',
    1: 'Limited',
    2: 'Event',
  };
  public static readonly ARMOR_TYPES = ['LightArmor', 'HeavyArmor', 'Unarmed', 'ElasticArmor'];
  public static readonly BULLET_TYPES = ['Explosion', 'Mystic', 'Pierce'];
  public static readonly STUDENT_AGE = [
    '11 years old',
    '15 years old',
    '16 years old',
    '17 years old',
    '18 years old',
    'Top Secret',
    'Age Unknown',
  ];
  public static readonly EQUIPMENT_TYPES = [
    'Hat',
    'Hairpin',
    'Watch',
    'Shoes',
    'Bag',
    'Charm',
    'Necklace',
    'Gloves',
    'Badge',
  ];
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
  public static readonly WEAPON_TYPE = ['SR', 'SG', 'AR', 'MG', 'SMG', 'HG', 'GL', 'MT', 'RG', 'RL', 'FT'];
  public static readonly STUDENT_SCHOOL_LOGO: { [key: string]: string } = {
    Abydos: 'https://schale.gg/images/schoolicon/School_Icon_ABYDOS_W.png',
    Arius: 'https://schale.gg/images/schoolicon/School_Icon_ARIUS_W.png',
    ETC: 'https://schale.gg/images/schoolicon/School_Icon_ETC_W.png',
    Gehenna: 'https://schale.gg/images/schoolicon/School_Icon_GEHENNA_W.png',
    Hyakkiyako: 'https://schale.gg/images/schoolicon/School_Icon_HYAKKIYAKO_W.png',
    Millenium: 'https://schale.gg/images/schoolicon/School_Icon_MILLENNIUM_W.png',
    RedWinter: 'https://schale.gg/images/schoolicon/School_Icon_REDWINTER_W.png',
    Shanghaijin: 'https://schale.gg/images/schoolicon/School_Icon_SHANHAIJING_W.png',
    SRT: 'https://schale.gg/images/schoolicon/School_Icon_SRT_W.png',
    Trinity: 'https://schale.gg/images/schoolicon/School_Icon_TRINITY_W.png',
    Valkyrie: 'https://schale.gg/images/schoolicon/School_Icon_VALKYRIE_W.png',
  };
}
