import { BuruakaCommandDecorator } from './decorators';
import { Injectable } from '@nestjs/common';
import type { SlashCommandContext } from 'necord';
import { Context, Options, Subcommand } from 'necord';
import { AppCacheService } from '../../../shared/cache';
import { BaEmbeds } from '../ba.embeds';
import { BaService } from '../ba.service';
import { ServerStatusDto } from '../dto';
import type { CurrentGacha, CurrentRaid, IConfig } from '../types/config';

@Injectable()
@BuruakaCommandDecorator()
export class ServerStatusCommands {
  constructor(
    private readonly baService: BaService,
    private readonly baEmbeds: BaEmbeds,
    private readonly cacheService: AppCacheService,
  ) {}

  @Subcommand({ name: 'ba-server',
    description: "Get Blue Archive server's status",
  })
  async serverStatus(
    @Context() [interaction]: SlashCommandContext,
    @Options() dto: ServerStatusDto,
  ) {
    await interaction.deferReply();
    const config = await this.cacheService.get<IConfig>('BA_Common');
    if (!config)
      return interaction.editReply({ content: '❌ Cache not found.' });

    const region = config.Regions[dto.regionId];
    region.studentsCount = await this.baService.getStudentCount(dto.regionId);
    region.raidsCount = await this.baService.getRaidCount(dto.regionId);
    region.eventsCount = region.Events?.length ?? 0;
    region.rerunEventsCount = (region.Events ?? []).filter((e: number) =>
      /^10/.test(e.toString()),
    ).length;
    region.incomingBirthdayStudents =
      await this.baService.getStudentHasBirthdayNextWeek(dto.regionId);

    const raids: Array<CurrentRaid & { info?: any }> = (
      region.CurrentRaid ?? []
    ).filter((r: any) => r.raid.toString().length < 4);
    const timeAttacks: Array<CurrentRaid & { info?: any }> = (
      region.CurrentRaid ?? []
    ).filter((r: any) => r.raid.toString().length >= 4);
    const raidPromises: Promise<any>[] = [];
    raids.forEach((r, i, arr) =>
      raidPromises.push(
        this.baService.getRaidById(r.raid).then((info) => {
          if (info) arr[i].info = info;
        }),
      ),
    );
    timeAttacks.forEach((ta, i, arr) =>
      raidPromises.push(
        this.baService.getTimeAttackById(ta.raid).then((info) => {
          if (info) arr[i].info = info;
        }),
      ),
    );
    await Promise.all(raidPromises);

    const gachaPromises: Promise<any>[] = [];
    (region.CurrentGacha ?? []).forEach(
      (gacha: CurrentGacha, i: number, arr: any) => {
        gachaPromises.push(
          this.baService
            .getStudentByIds(gacha.characters as any)
            .then((students) => {
              if (students.length > 0) arr[i].characters = students;
            }),
        );
      },
    );
    await Promise.all(gachaPromises);

    return interaction.editReply({
      embeds: [await this.baEmbeds.server(region, interaction.user)],
    });
  }
}
