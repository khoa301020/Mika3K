export interface IEnemy {
  Enemies: { [key: string]: Enemy };
  Skills: Skills;
}

export interface Enemy {
  Id: number;
  DevName: string;
  Name: string;
  Icon?: string;
  Transcendence?: Array<number[]>;
  SquadType: SquadType;
  Rank: Rank;
  BulletType: BulletType;
  ArmorType: Type;
  Size: Size | null;
  IsNPC?: boolean;
  StabilityPoint: number;
  AttackPower1: number;
  AttackPower100: number;
  MaxHP1: number;
  MaxHP100: number;
  DefensePower1: number;
  DefensePower100: number;
  HealPower1: number;
  HealPower100: number;
  DodgePoint: number;
  AccuracyPoint: number;
  CriticalPoint: number;
  CriticalResistPoint?: number;
  Range: number;
  StabilityRate?: number;
  MoveSpeed?: number;
  BodyRadius?: number;
  StreetBattleAdaptation?: number;
  IndoorBattleAdaptation?: number;
  AmmoCount?: number;
  AmmoCost?: number;
  Skills?: string[];
  GroggyGauge?: number;
  GroggyTime?: number;
  OutdoorBattleAdaptation?: number;
  PhaseChange?: PhaseChange[];
  ServerData?: ServerData;
  CriticalDamageResistRate?: number;
  EnhancePierceRate?: number;
  DamagedRatio?: number;
  OppressionPower?: number;
  CriticalDamageRate?: number;
  DefensePenetration1?: number;
  DefensePenetration100?: number;
  OppressionResist?: number;
  StatLevelUpType?: StatLevelUpType;
  DamagedRatio2?: number;
  ExDamagedRatio?: number;
  DamageRatio2?: number;
  EnhanceMysticRate?: number;
  AllowDamageAttributeChange?: boolean;
}

export type Type =
  | 'Normal'
  | 'LightArmor'
  | 'Unarmed'
  | 'HeavyArmor'
  | 'ElasticArmor';

export type BulletType = 'Normal' | 'Explosion' | 'Mystic' | 'Pierce' | 'Sonic';

export interface PhaseChange {
  Phase: number;
  Trigger: Trigger;
  Argument: number;
}

export type Trigger = 'HPUnder';

export type Rank =
  | 'Student'
  | 'Minion'
  | 'Elite'
  | 'Champion'
  | 'Boss'
  | 'Summoned'
  | 'Hallucination'
  | 'DestructibleProjectile';

export interface ServerData {
  Global?: Global;
  Cn?: CN;
}

export interface CN {
  MaxHP1?: number;
  MaxHP100?: number;
  GroggyGauge?: number;
  DodgePoint?: number;
  CriticalResistPoint?: number;
}

export interface Global {
  MaxHP1?: number;
  MaxHP100?: number;
  GroggyGauge?: number;
  DamagedRatio?: number;
}

export type Size = 'Medium' | 'Small' | 'Large' | 'XLarge';

export type SquadType = 'Support' | 'Main';

export type StatLevelUpType = 'TimeAttack';

export interface Skills {
  BinahNormalSkill01: BinahNormalSkill01;
  BinahExSkill01: BinahExSkill01;
  BinahTormentExSkill01: BinahExSkill01;
  BinahLunaticExSkill01: BinahExSkill01;
  BinahExSkill02: BinahExSkill02;
  BinahInsaneExSkill02: BinahExSkill02;
  BinahExSkill03: BinahExSkill03;
  BinahPassive01: BinahLunaticPassive02;
  BinahLunaticPassive02: BinahLunaticPassive02;
  ChesedDroidDecagramARNormalSkill01: L01;
  ChesedDroneDecagramMissileNormalSkill01: L01;
  ChesedDroneDecagramVulcanNormalSkill01: L01;
  ChesedGuardTowerDecagramGrenadeNormalSkill01: BinahNormalSkill01;
  ChesedGoliathDecagramVulcanNormalSkill01: L01;
  ChesedGoliathDecagramVulcanPublicSkill01: BinahNormalSkill01;
  ChesedGoliathDecagramVulcanPassiveSkill01: BinahNormalSkill01;
  ChesedSweeperDecagramTaserNormalSkill01: L01;
  ChesedDroidDecagramARPublicSkill01: ChesedDroidDecagramARPublicSkill01;
  ChesedPassive01: BinahNormalSkill01;
  ShiroNormal01: L01;
  ShiroEx01: RoEx01;
  ShiroInsaneEx01: NeEx01;
  ShiroTormentEx01: ShiroTormentEx01;
  ShiroEx04: BinahNormalSkill01;
  ShiroInsaneEx04: BinahNormalSkill01;
  ShiroTormentEx07: BinahNormalSkill01;
  KuroNormal01: BinahNormalSkill01;
  KuroEx01: RoEx01;
  KuroInasneEx01: NeEx01;
  KuroInasneEx10: En0005Ex01AttackerSide;
  ShiroKuroPassive01: BinahNormalSkill01;
  HieronymusNormal01: Normal01;
  HieronymusEx01: En0006Ex011_Phase;
  HieronymusEx02: En0009Ex03;
  HieronymusInsaneEx02: HieronymusInsaneEx02;
  HieronymusEx03: En0006Ex011_Phase;
  HieronymusEx04: En0006Ex011_Phase;
  HieronymusInsaneEx04: En0006Ex011_Phase;
  HieronymusPassive01: BinahNormalSkill01;
  HieronymusInsanePassive02: BinahNormalSkill01;
  HieronymusTormentPassiveDummy01: BinahNormalSkill01;
  HieronymusRelicPassive03: BinahNormalSkill01;
  KaitenFxMk0NormalSkill01: BinahNormalSkill01;
  KaitenFxMk0ExSkill01: BinahNormalSkill01;
  KaitenFxMk0TormentExSkill01: BinahNormalSkill01;
  KaitenFxMk0ExSkill02: BinahNormalSkill01;
  KaitenFxMk0ExSkill03: BinahNormalSkill01;
  KaitenFxMk0ExSkill04: BinahNormalSkill01;
  KaitenFxMk0InsaneExSkill05: BinahNormalSkill01;
  KaitenFxMk0PassiveSkill01: BinahNormalSkill01;
  KaitenFxMk0PassiveSkill03: BinahNormalSkill01;
  KaitenFxMk0InsanePassiveSkill03: BinahNormalSkill01;
  KaitenrangerRedNormal01: BinahNormalSkill01;
  KaitenrangerRedPublic02: BinahNormalSkill01;
  KaitenrangerBlackNormal01: BinahNormalSkill01;
  KaitenrangerBlackPublic02: BinahNormalSkill01;
  KaitenrangerGreenNormal01: L01;
  KaitenrangerGreenPublic02: BinahNormalSkill01;
  KaitenrangerYellowNormal01: L01;
  KaitenrangerYellowPublic02: En0006Ex011_Phase;
  KaitenrangerPinkNormal01: L01;
  KaitenrangerPinkPublic02: BinahNormalSkill01;
  KaitenrangerRedTormentPassive01: BinahLunaticPassive02;
  Perorozilla01Normal01: BinahNormalSkill01;
  Perorozilla01MiddleSize01Normal01: BinahNormalSkill01;
  Perorozilla01Ex01: BinahExSkill03;
  Perorozilla01InsaneEx01: Perorozilla01InsaneEx01;
  Perorozilla01TormentEx01: Perorozilla01TormentEx01;
  Perorozilla01LunaticEx01: Perorozilla01LunaticEx01;
  Perorozilla01Ex02: BinahNormalSkill01;
  Perorozilla01LunaticEx02: En0005Ex01AttackerSide;
  Perorozilla01Ex10: BinahNormalSkill01;
  Perorozilla01TormentPassive02: BinahNormalSkill01;
  Perorozilla01LunaticPassive02: BinahNormalSkill01;
  HODNormal01: L01;
  HODEx01: BinahNormalSkill01;
  HODInsaneEx01: BinahNormalSkill01;
  HODEx02: BinahNormalSkill01;
  HODEx04: BinahNormalSkill01;
  HODEx05: BinahNormalSkill01;
  HODLunaticEx05: BinahNormalSkill01;
  HODPassive01_Normal: BinahLunaticPassive02;
  HODPassive01_Lunatic: BinahLunaticPassive02;
  HODTemporaryTowerNormal01: L01;
  HODTemporaryTowerExtraPassive01: BinahLunaticPassive02;
  HODTemporaryTowerTormentExtraPassive01: BinahNormalSkill01;
  HODTemporaryTowerPassive02_Normal: BinahNormalSkill01;
  HODTemporaryTowerPassive02_Lunatic: BinahLunaticPassive02;
  GozNormal01: GozNormal01;
  GozInsaneNormal01: GozNormal01;
  GozTerrorKumabotPapaSlumpiaSG01Normal01: Goz01_Normal01;
  GozInsaneTerrorKumabotPapaSlumpiaSG01Normal01: Goz01_Normal01;
  GozTerrorKumabotPapaSlumpiaSG01Ex01: GozTerrorKumabotPapaSlumpiaSg01Ex01;
  GozInsaneTerrorKumabotPapaSlumpiaSG01Ex01: GozTerrorKumabotPapaSlumpiaSg01Ex01;
  GozTerrorUsagibotSlumpiaAR01Normal01: Goz01_Normal01;
  GozInsaneTerrorUsagibotSlumpiaAR01Normal01: Goz01_Normal01;
  GozTerrorUsagibotSlumpiaAR01Ex01: GozTerrorUsagibotSlumpiaAr01Ex01;
  GozInsaneTerrorUsagibotSlumpiaAR01Ex01: GozTerrorUsagibotSlumpiaAr01Ex01;
  GozEx02: En0020Ex05;
  GozInsaneEx02: En0020Ex05;
  GozLunaticEx02: GozLunaticEx02;
  GozEx03: GozEx03;
  GozInsaneEx03: GozEx03;
  GozTormentEx03: GozTormentEx03;
  GozLunaticEx03_Yellow: BinahNormalSkill01;
  GozLunaticEx03_Blue: BinahNormalSkill01;
  GozEx04_0: En0020Ex05;
  GozInsaneEx04_0: En0020Ex05;
  GozEx04_1: En0020Ex05;
  GozInsaneEx04_1: En0020Ex05;
  GozEx04_2: BinahNormalSkill01;
  GozInsaneEx04_2: BinahNormalSkill01;
  EN0005Normal01: L01;
  EN0005_Ex01_AttackerSide: En0005Ex01AttackerSide;
  EN0005_Ex01_Lunatic_AttackerSide: En0005Ex01AttackerSide;
  EN0005_Ex01_DefenderSide: EN0005Ex01DefenderSide;
  EN0005_Ex03_Center: BinahNormalSkill01;
  EN0005_Ex03_Lunatic_Center: BinahLunaticPassive02;
  EN0005_Passive01: En000;
  EN0005_Torment_Passive01: En000;
  EN0005_Passive05_Lunatic: BinahLunaticPassive02;
  HoverCraftWakamo01Normal01: L01;
  HoverCraftWakamo01Ex01: BinahNormalSkill01;
  HoverCraftWakamo01Ex02: BinahNormalSkill01;
  HoverCraftWakamo01Ex03: BinahNormalSkill01;
  HoverCraftWakamo01Passive01: BinahNormalSkill01;
  HoverCraftNormal01: L01;
  HoverCraftEx01: BinahNormalSkill01;
  HoverCraftPassive02: BinahNormalSkill01;
  HoverCraftPassive04: BinahNormalSkill01;
  EN0006Normal01: En0006Ex011_Phase;
  EN0006Ex01_1Phase: En0006Ex011_Phase;
  EN0006Ex02_1Phase: En0006Ex011_Phase;
  EN0006Ex04: En0006Ex011_Phase;
  EN0006Ex05: En0006Ex011_Phase;
  EN0006Soldier01Normal01: En0006Ex011_Phase;
  EN0006_Insane_Soldier01Normal01: En0006Ex011_Phase;
  EN0008Normal01: BinahNormalSkill01;
  EN0008Ex01: BinahNormalSkill01;
  EN0008Ex02First: En00;
  EN0008Ex02Center: En0005Ex01AttackerSide;
  EN0008Ex03Strong: BinahExSkill01;
  EN0008Ex04Strong: BinahNormalSkill01;
  EN0008Ex05: BinahNormalSkill01;
  EN0008Passive08: BinahLunaticPassive02;
  EN0008Passive01: BinahNormalSkill01;
  EN0008Passive10: BinahLunaticPassive02;
  EN0008Passive04: BinahLunaticPassive02;
  EN0009ExtraPassive01: BinahLunaticPassive02;
  EN0009Normal01: L01;
  EN0009Ex01: En0006Ex011_Phase;
  EN0009Ex01_Strong: BinahNormalSkill01;
  EN0009Ex02_Weak: En0009Ex02;
  EN0009Ex02: En0009Ex02;
  EN0009Ex02_Mystic_100: En0009Ex02;
  EN0009Ex03: En0009Ex03;
  EN0009Ex03_Strong: En0009Ex03;
  EN0009Ex05: BinahNormalSkill01;
  EN0009Passive01: BinahNormalSkill01;
  EN0009Passive05_75: BinahNormalSkill01;
  EN0009Passive04: BinahLunaticPassive02;
  EN0009Passive06: BinahNormalSkill01;
  EN0009Passive03: En000;
  EN0010Normal01: Normal01;
  EN0010Ex01: BinahNormalSkill01;
  EN0010Ex02: BinahNormalSkill01;
  EN0010Ex03: BinahNormalSkill01;
  EN0010Ex04: En0006Ex011_Phase;
  EN0010NotInsanePassive02: EN0010NotInsanePassive02Class;
  EN0010InsanePassive02: BinahLunaticPassive02;
  EN0010Passive03: BinahLunaticPassive02;
  EN0010Passive04: BinahNormalSkill01;
  EN0010Passive05: BinahNormalSkill01;
  EN0010IcePropPassive01: BinahLunaticPassive02;
  Totem03TimeAttackPassive01: BinahNormalSkill01;
  EN0011Normal01: BinahNormalSkill01;
  EN0011Ex01ALL: BinahNormalSkill01;
  EN0011SubCoreBlueEx01: En0005Ex01AttackerSide;
  EN0011SubCoreRedEx01: BinahNormalSkill01;
  EN0011SubCoreYellowEx01: BinahNormalSkill01;
  EN0011Ex02: BinahNormalSkill01;
  EN0011Ex03: En0005Ex01AttackerSide;
  EN0011Ex04: BinahNormalSkill01;
  EN0011CorePassive03: BinahNormalSkill01;
  EN0011Passive03: BinahLunaticPassive02;
  EN0011Passive06: BinahNormalSkill01;
  EN0011_ShieldDrone_Passive01_Effect01: BinahNormalSkill01;
  EN0011CorePassive07: BinahNormalSkill01;
  EN0011Ex06: BinahNormalSkill01;
  EN0013Normal01: En001Normal01;
  EN0013Ex01: En0005Ex01AttackerSide;
  EN0013InsaneEx01: En0005Ex01AttackerSide;
  EN0013RightHandEx01: En00;
  EN0013GroundPassive01: EN0010NotInsanePassive02Class;
  EN0013Passive02: EN0010NotInsanePassive02Class;
  EN0013TormentPassive02: EN0010NotInsanePassive02Class;
  EN0013BlueCorePassive01: EN0013BlueCorePassive01Class;
  EN0013Passive04: EN0013BlueCorePassive01Class;
  EN0013RightHandPassive02: BinahNormalSkill01;
  KetherDecagramCannonWorldRaid01Normal01: BinahNormalSkill01;
  KetherDecagramVulcanWorldRaid01Normal01: BinahNormalSkill01;
  KetherDecagramEMPWorldRaid01Normal01: L01;
  KetherDecagramVulcanWorldRaid01Ex01: BinahNormalSkill01;
  KetherDecagramVulcanWorldRaid01Ex01_Pierce: BinahNormalSkill01;
  KetherDecagramCannonWorldRaid01Ex01: BinahNormalSkill01;
  KetherDecagramCannonWorldRaid01Ex01_Pierce: BinahNormalSkill01;
  KetherDecagramLaborCannonWorldRaidEx01: BinahNormalSkill01;
  KetherDecagramCannonWorldRaidA01Passive04: BinahLunaticPassive02;
  KetherDecagramEMPWorldRaid01Passive01: BinahLunaticPassive02;
  KetherDecagramEMPWorldRaid01Ex01: En0005Ex01AttackerSide;
  KetherDecagramEMPWorldRaid01Passive03: BinahLunaticPassive02;
  KetherDecagramSweeperWhiteWorldRaidNormal02: KetherDecagramSweeperWhiteWorldRaidNormal02;
  KetherDecagramSweeperWhiteWorldRaidPassive01: BinahLunaticPassive02;
  EN0015Ex02: BinahExSkill01;
  EN0015Ex03: En00;
  EN0015Ex05: En00;
  EN0015Passive06: BinahLunaticPassive02;
  EN0015Passive03_A: BinahLunaticPassive02;
  EN0015Passive04: BinahLunaticPassive02;
  EN0015EnemyNormal01: En001Normal01;
  EN0015UnionEnemyPassive01: EN0013BlueCorePassive01Class;
  Furious01Passive01: BinahNormalSkill01;
  Furious01Ex02: BinahLunaticPassive02;
  EN0020Normal01: L01;
  EN0020Ex01: BinahNormalSkill01;
  EN0020Ex02: BinahNormalSkill01;
  EN0020Ex03: En00;
  EN0020Ex04: EN0020Ex04;
  EN0020Ex05: En0020Ex05;
  EN0020Ex06: En0020Ex05;
  EN0020DummyEx01: BinahNormalSkill01;
  LaborDecagramOriginalNormal01: BinahNormalSkill01;
  LaborDecagramCannonNormal01: L01;
  LaborDecagramCannonEx01: BinahNormalSkill01;
  LaborDecagramGuardNormal01: L01;
  EN0020JyacoPassive02: BinahLunaticPassive02;
  EN0020JyacoPassive04: BinahNormalSkill01;
  EN0020DummyPassive03: BinahLunaticPassive02;
}

export interface BinahExSkill01 {
  Type: BinahExSkill01Type;
  Effects: BinahExSkill01Effect[];
  Icon: string;
  IconType: IconType;
  Name: string;
  Radius: BinahExSkill01Radius[];
}

export interface BinahExSkill01Effect {
  Type: PurpleType;
  Scale: Array<number[]>;
  Hits: number[];
  CanEvade?: boolean;
  CriticalCheck?: CriticalCheck;
  HitFrames?: number[];
  Group?: number;
}

export type CriticalCheck = 'Never';

export type PurpleType = 'Damage' | 'Buff' | 'CrowdControl';

export type IconType = 'raid' | 'multifloor';

export interface BinahExSkill01Radius {
  Type: RadiusType;
  Width: number;
  Height: number;
}

export type RadiusType = 'Obb' | 'Circle' | 'Bounce' | 'Fan';

export type BinahExSkill01Type =
  | 'Passive'
  | 'Ex'
  | 'ExtraPassive'
  | 'Normal'
  | 'Public';

export interface BinahExSkill02 {
  Type: BinahExSkill01Type;
  Effects: BinahExSkill02Effect[];
  Icon: string;
  IconType: IconType;
  Name: string;
  GroupLabel: { [key: string]: BinahExSkill02GroupLabel };
}

export interface BinahExSkill02Effect {
  Type: PurpleType;
  Scale: Array<number[]>;
  Hits: number[];
  Group?: number;
  CriticalCheck?: CriticalCheck;
  CanEvade?: boolean;
}

export interface BinahExSkill02GroupLabel {
  LabelTranslated: string;
}

export interface BinahExSkill03 {
  Type: BinahExSkill01Type;
  ListCharacter: number;
  Effects: BinahExSkill03Effect[];
  Icon: string;
  IconType: IconType;
  Name: string;
}

export interface BinahExSkill03Effect {
  Type: PurpleType;
  Scale?: Array<number[]>;
  Hits?: number[];
  CanEvade?: boolean;
  Target?: Target[];
  Value?: Array<number[]>;
  Stat?: string;
  Channel?: number;
  CriticalCheck?: string;
  StackSame?: number;
  HitFrames?: number[];
  SubstituteCondition?: string;
  SubstituteScale?: Array<number[]>;
  Group?: number;
}

export type Target = 'Enemy' | 'Self' | 'AllyMain';

export interface BinahLunaticPassive02 {
  Type: BinahExSkill01Type;
  ListCharacter?: number;
  Effects: BinahLunaticPassive02Effect[];
  Icon: string;
  IconType?: IconType;
  Name?: null | string;
  RaidSkillId?: string;
  MaxLevel?: number;
}

export interface BinahLunaticPassive02Effect {
  Type: PurpleType;
  Target: Target[];
  Value: Array<number[]>;
  Stat: string;
  Channel: number;
  StackSame?: number;
  StackingIcon?: StackingIcon[];
  Icon?: string;
  Restrictions?: Restriction[];
}

export interface Restriction {
  Property: Property;
  Operand: Operand;
  Value: SquadType;
}

export type Operand = 'Equal' | 'NotEqual';

export type Property = 'SquadType';

export type StackingIcon =
  | 'Special_DebuffCountRed'
  | 'Special_DebuffCountYellow'
  | 'Special_DebuffCountGreen';

export interface BinahNormalSkill01 {
  Type: BinahExSkill01Type;
  Effects: BinahNormalSkill01Effect[];
  Icon: string;
  IconType?: IconType;
  Name?: null | string;
  Desc?: string;
  Radius?: BinahNormalSkill01Radius[];
  ListCharacter?: number;
  RaidSkillId?: string;
  MaxLevel?: number;
}

export interface BinahNormalSkill01Effect {
  Type: PurpleType;
  Scale?: Array<number[] | number>;
  Hits?: number[];
  Target?: Target[];
  Value?: Array<number[]>;
  Stat?: string;
  Channel?: number;
  HitFrames?: number[];
  CriticalCheck?: CriticalCheck;
  SubstituteCondition?: string;
  SubstituteScale?: Array<number[]>;
  StackSame?: number;
  SourceStat?: string;
  ApplyBulletType?: boolean;
  Chance?: number;
  Icon?: string;
  CanEvade?: boolean;
}

export interface BinahNormalSkill01Radius {
  Type: RadiusType;
  Radius?: number;
  Degree?: number;
  Width?: number;
  Height?: number;
}

export interface L01 {
  Type: Type;
  Icon: ChesedDroidDecagramARNormalSkill01Icon;
  Effects: ChesedDroidDecagramARNormalSkill01Effect[];
  Radius?: ChesedDroidDecagramARNormalSkill01Radius[];
}

export interface ChesedDroidDecagramARNormalSkill01Effect {
  Type: PurpleType;
  Scale: Array<number[]>;
  Hits: number[];
}

export type ChesedDroidDecagramARNormalSkill01Icon =
  | 'COMMON_SKILLICON_TARGET'
  | 'COMMON_SKILLICON_CIRCLE';

export interface ChesedDroidDecagramARNormalSkill01Radius {
  Type: RadiusType;
  Width?: number;
  Height?: number;
  Radius?: number;
}

export interface ChesedDroidDecagramARPublicSkill01 {
  Type: BinahExSkill01Type;
  Icon: string;
  Effects: BinahExSkill01Effect[];
  Name: string;
  Desc: string;
  Radius: ChesedDroidDecagramARPublicSkill01Radius[];
}

export interface ChesedDroidDecagramARPublicSkill01Radius {
  Type: RadiusType;
  Radius: number;
}

export interface En0005Ex01AttackerSide {
  Type: BinahExSkill01Type;
  ListCharacter?: number;
  Effects: BinahExSkill03Effect[];
  Icon: string;
  IconType: IconType;
  Name: string;
  Radius?: ChesedDroidDecagramARPublicSkill01Radius[];
}

export interface EN0005Ex01DefenderSide {
  Type: BinahExSkill01Type;
  ListCharacter: number;
  Effects: BinahLunaticPassive02Effect[];
  Icon: string;
  IconType: IconType;
  Name: string;
  Radius: ChesedDroidDecagramARPublicSkill01Radius[];
}

export interface En000 {
  Type: BinahExSkill01Type;
  ListCharacter: number;
  Effects: BinahLunaticPassive02Effect[];
  Icon: string;
  IconType: IconType;
  Name: string;
}

export interface En0006Ex011_Phase {
  Type: BinahExSkill01Type;
  Effects: EN0006Ex011PhaseEffect[];
  Icon: string;
  IconType?: IconType;
  Name?: null | string;
  Radius?: ChesedDroidDecagramARNormalSkill01Radius[];
  Desc?: string;
  RaidSkillId?: string;
}

export interface EN0006Ex011PhaseEffect {
  Type: PurpleType;
  Scale: Array<number[]>;
  Hits: number[];
  CriticalCheck: CriticalCheck;
}

export interface En00 {
  Type: BinahExSkill01Type;
  Effects: BinahExSkill01Effect[];
  Icon: string;
  IconType: IconType;
  Name: string;
  Radius: ChesedDroidDecagramARPublicSkill01Radius[];
}

export interface En0009Ex02 {
  Type: BinahExSkill01Type;
  Effects: EN0009Ex02Effect[];
  Icon: string;
  IconType: IconType;
  Name: string;
  GroupLabel: { [key: string]: EN0009Ex02GroupLabel };
}

export interface EN0009Ex02Effect {
  Type: FluffyType;
  Scale: Array<number[] | number>;
  Hits?: number[];
  Group?: number;
  CriticalCheck?: CriticalCheck;
  Duration?: number;
  Period?: number;
  Icon?: string;
}

export type FluffyType = 'Damage' | 'DamageDebuff';

export interface EN0009Ex02GroupLabel {
  Icon: PurpleIcon;
  LabelTranslated: LabelTranslated;
}

export type PurpleIcon =
  | 'skill/COMMON_SKILLICON_BARRIEROBSTACLE.webp'
  | 'skill/Carrier_SKILLICON_Furious01_Ex02.webp'
  | 'buff/Buff_Shield.webp';

export type LabelTranslated = 'setting_off' | 'setting_on';

export interface En0009Ex03 {
  Type: BinahExSkill01Type;
  Effects: EN0009Ex02Effect[];
  Icon: string;
  IconType: IconType;
  Name: string;
  Radius: ChesedDroidDecagramARPublicSkill01Radius[];
}

export interface Normal01 {
  Type: Type;
  Icon: ChesedDroidDecagramARNormalSkill01Icon;
  Effects: EN0006Ex011PhaseEffect[];
}

export interface EN0010NotInsanePassive02Class {
  Type: BinahExSkill01Type;
  ListCharacter: number;
  Effects: BinahLunaticPassive02Effect[];
  Icon: string;
  IconType: IconType;
  Name?: string;
  RaidSkillId?: string;
}

export interface EN0013BlueCorePassive01Class {
  Type: BinahExSkill01Type;
  RaidSkillId: string;
  Effects: EN0013BlueCorePassive01Effect[];
  Icon: string;
  IconType: IconType;
}

export interface EN0013BlueCorePassive01Effect {
  Type: PurpleType;
  Scale: Array<number[]>;
  Hits: number[];
  CriticalCheck: CriticalCheck;
  CanEvade: boolean;
}

export interface En001Normal01 {
  Type: Type;
  Icon: ChesedDroidDecagramARNormalSkill01Icon;
  Effects: BinahExSkill01Effect[];
  Radius?: ChesedDroidDecagramARPublicSkill01Radius[];
}

export interface EN0020Ex04 {
  Type: BinahExSkill01Type;
  Effects: BinahExSkill01Effect[];
  Icon: string;
  IconType: IconType;
  Name: string;
  GroupLabel: { [key: string]: EN0009Ex02GroupLabel };
  Radius: BinahExSkill01Radius[];
}

export interface En0020Ex05 {
  Type: BinahExSkill01Type;
  Effects: BinahExSkill01Effect[];
  Icon: string;
  IconType: IconType;
  Name?: string;
  GroupLabel: { [key: string]: EN0009Ex02GroupLabel };
  Radius?: BinahExSkill01Radius[];
  RaidSkillId?: string;
}

export interface GozEx03 {
  Type: BinahExSkill01Type;
  Effects: GozEx03Effect[];
  Icon: string;
  IconType: IconType;
  Name?: string;
  GroupLabel: { [key: string]: EN0009Ex02GroupLabel };
  RaidSkillId?: string;
}

export interface GozEx03Effect {
  Type: PurpleType;
  Scale: Array<number[] | number>;
  Hits?: number[];
  Group?: number;
  Chance?: number;
  Icon?: string;
  CanEvade?: boolean;
}

export interface GozNormal01 {
  Type: Type;
  Icon: ChesedDroidDecagramARNormalSkill01Icon;
  Effects: GozInsaneNormal01Effect[];
  GroupLabel: { [key: string]: EN0009Ex02GroupLabel };
}

export interface GozInsaneNormal01Effect {
  Type: PurpleType;
  Scale: Array<number[]>;
  Hits: number[];
  Group: number;
}

export interface GozTerrorKumabotPapaSlumpiaSg01Ex01 {
  Type: BinahExSkill01Type;
  Icon: string;
  Effects: GozInsaneTerrorKumabotPapaSlumpiaSG01Ex01Effect[];
  Name: null;
  Desc: string;
  GroupLabel: { [key: string]: EN0009Ex02GroupLabel };
  Radius: GozInsaneTerrorKumabotPapaSlumpiaSG01Ex01Radius[];
}

export interface GozInsaneTerrorKumabotPapaSlumpiaSG01Ex01Effect {
  Type: PurpleType;
  Scale: Array<number[]>;
  Hits: number[];
  Group: number;
  CriticalCheck: CriticalCheck;
}

export interface GozInsaneTerrorKumabotPapaSlumpiaSG01Ex01Radius {
  Type: RadiusType;
  Radius: number;
  Degree: number;
}

export interface Goz01_Normal01 {
  Type: Type;
  Icon: ChesedDroidDecagramARNormalSkill01Icon;
  Effects: GozInsaneTerrorKumabotPapaSlumpiaSG01Ex01Effect[];
  GroupLabel: { [key: string]: EN0009Ex02GroupLabel };
}

export interface GozTerrorUsagibotSlumpiaAr01Ex01 {
  Type: BinahExSkill01Type;
  Icon: ChesedDroidDecagramARNormalSkill01Icon;
  Effects: BinahExSkill01Effect[];
  Name: null;
  Desc: string;
  GroupLabel: { [key: string]: EN0009Ex02GroupLabel };
  Radius: ChesedDroidDecagramARPublicSkill01Radius[];
}

export interface GozLunaticEx02 {
  Type: BinahExSkill01Type;
  ListCharacter: number;
  Effects: BinahExSkill03Effect[];
  Icon: string;
  IconType: IconType;
  Name: string;
  GroupLabel: { [key: string]: EN0009Ex02GroupLabel };
}

export interface GozTormentEx03 {
  Type: BinahExSkill01Type;
  ListCharacter: number;
  Effects: GozTormentEx03Effect[];
  Icon: string;
  IconType: IconType;
  Name: string;
  GroupLabel: { [key: string]: EN0009Ex02GroupLabel };
}

export interface GozTormentEx03Effect {
  Type: PurpleType;
  Scale?: Array<number[] | number>;
  Hits?: number[];
  Group?: number;
  Chance?: number;
  Icon?: string;
  Target?: Target[];
  Value?: Array<number[]>;
  Stat?: string;
  Channel?: number;
  LabelTranslated?: string;
}

export interface HieronymusInsaneEx02 {
  Type: BinahExSkill01Type;
  ListCharacter: number;
  Effects: HieronymusInsaneEx02Effect[];
  Icon: string;
  IconType: IconType;
  Name: string;
  Radius: ChesedDroidDecagramARPublicSkill01Radius[];
}

export interface HieronymusInsaneEx02Effect {
  Type: string;
  Scale?: Array<number[] | number>;
  Duration?: number;
  Period?: number;
  Icon?: string;
  Hits?: number[];
  CriticalCheck?: CriticalCheck;
  Target?: Target[];
  Value?: Array<number[]>;
  Stat?: string;
  Channel?: number;
}

export interface KetherDecagramSweeperWhiteWorldRaidNormal02 {
  Type: Type;
  Icon: string;
  Effects: BinahExSkill02Effect[];
}

export interface RoEx01 {
  Type: BinahExSkill01Type;
  Effects: GozInsaneNormal01Effect[];
  Icon: string;
  IconType: IconType;
  Name: string;
  GroupLabel: { [key: string]: KuroEx01GroupLabel };
  Radius?: ChesedDroidDecagramARPublicSkill01Radius[];
}

export interface KuroEx01GroupLabel {
  Icon: FluffyIcon;
  Label: Label;
}

export type FluffyIcon = 'ui/ATG.png';

export type Label = '0%' | '50%' | '100%';

export interface NeEx01 {
  Type: BinahExSkill01Type;
  Effects: BinahExSkill03Effect[];
  Icon: string;
  IconType: IconType;
  Name: string;
  GroupLabel: { [key: string]: KuroEx01GroupLabel };
  ListCharacter?: number;
  Radius?: ChesedDroidDecagramARPublicSkill01Radius[];
}

export interface Perorozilla01InsaneEx01 {
  Type: BinahExSkill01Type;
  Effects: BinahExSkill01Effect[];
  Icon: string;
  IconType: IconType;
  Name: string;
  Radius: GozInsaneTerrorKumabotPapaSlumpiaSG01Ex01Radius[];
}

export interface Perorozilla01LunaticEx01 {
  Type: BinahExSkill01Type;
  ListCharacter: number;
  Effects: BinahExSkill03Effect[];
  Icon: string;
  IconType: IconType;
  Name: string;
  GroupLabel: { [key: string]: BinahExSkill02GroupLabel };
}

export interface Perorozilla01TormentEx01 {
  Type: BinahExSkill01Type;
  ListCharacter: number;
  Effects: BinahExSkill03Effect[];
  Icon: string;
  IconType: IconType;
  Name: string;
  GroupLabel: { [key: string]: BinahExSkill02GroupLabel };
  Radius: GozInsaneTerrorKumabotPapaSlumpiaSG01Ex01Radius[];
}

export interface ShiroTormentEx01 {
  Type: BinahExSkill01Type;
  ListCharacter: number;
  Effects: GozTormentEx03Effect[];
  Icon: string;
  IconType: IconType;
  Name: string;
  GroupLabel: { [key: string]: KuroEx01GroupLabel };
  Radius: ChesedDroidDecagramARPublicSkill01Radius[];
}
