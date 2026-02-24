import { BooleanOption, NumberOption, StringOption } from 'necord';
import * as C from '../ba.constants';

export class StudentSearchDto {
  @BooleanOption({
    name: 'display',
    description: 'Public display?',
    required: true,
  })
  display: boolean;

  @StringOption({ name: 'name', description: 'Student name', required: false })
  name?: string;

  @StringOption({
    name: 'school',
    description: "Student's school",
    required: false,
    choices: C.SCHOOL.slice(0, 25).map((s) => ({ name: s, value: s })),
  })
  school?: string;

  @NumberOption({
    name: 'rarity',
    description: "Student's rarity",
    required: false,
    choices: C.STUDENT_RARITY.map((r) => ({ name: `${r}★`, value: r })),
  })
  rarity?: number;

  @StringOption({
    name: 'squad-type',
    description: 'Squad type',
    required: false,
    choices: C.SQUAD_TYPES.map((s) => ({ name: s, value: s })),
  })
  squadType?: string;

  @StringOption({
    name: 'tactic-role',
    description: 'Tactic role',
    required: false,
    choices: C.TACTIC_ROLE.map((r) => ({ name: r, value: r })),
  })
  tacticRole?: string;

  @StringOption({
    name: 'position',
    description: 'Position',
    required: false,
    choices: C.POSITION.map((p) => ({ name: p, value: p })),
  })
  position?: string;

  @StringOption({
    name: 'armor-type',
    description: 'Armor type',
    required: false,
    choices: C.ARMOR_TYPES.map((a) => ({ name: a, value: a })),
  })
  armorType?: string;

  @StringOption({
    name: 'bullet-type',
    description: 'Bullet type',
    required: false,
    choices: C.BULLET_TYPES.map((b) => ({ name: b, value: b })),
  })
  bulletType?: string;

  @StringOption({
    name: 'sort-by',
    description: 'Sort by (Name by default)',
    required: false,
    choices: Object.entries(C.SORT_BY)
      .slice(0, 25)
      .map(([k, v]) => ({ name: k, value: v })),
  })
  sortBy?: string;

  @NumberOption({
    name: 'order-by',
    description: 'Ascending or Descending',
    required: false,
    choices: [
      { name: 'Ascending', value: 1 },
      { name: 'Descending', value: -1 },
    ],
  })
  orderBy?: number;
}

export class RaidSearchDto {
  @BooleanOption({
    name: 'display',
    description: 'Public display?',
    required: true,
  })
  display: boolean;

  @NumberOption({
    name: 'raid',
    description: 'Select raid',
    required: true,
    choices: Object.entries(C.RAIDS).map(([k, v]) => ({ name: k, value: v })),
  })
  raidId: number;

  @StringOption({
    name: 'difficulty',
    description: 'Raid difficulty',
    required: true,
    choices: Object.keys(C.RAID_DIFFICULTIES).map((d) => ({
      name: d,
      value: d,
    })),
  })
  difficulty: string;
}

export class ServerStatusDto {
  @NumberOption({
    name: 'server',
    description: 'Choose server',
    required: true,
    choices: Object.entries(C.REGIONS).map(([k, v]) => ({ name: k, value: v })),
  })
  regionId: number;
}
