import { ApplicationCommandOptionType, CommandInteraction } from 'discord.js';
import { Discord, Slash, SlashChoice, SlashGroup, SlashOption } from 'discordx';
import { BlueArchiveConstants } from '../../constants/index.js';
import { cache } from '../../main.js';
import { BA_ServerEmbed } from '../../providers/embeds/bluearchiveEmbed.js';
import { getData } from '../../services/bluearchive.js';
import { CurrentGacha, CurrentRaid, IConfig } from '../../types/bluearchive/config.js';
import { IStudent } from '../../types/bluearchive/student.js';
import { editOrReplyThenDelete } from '../../utils/index.js';

@Discord()
@SlashGroup({ name: 'buruaka', description: 'Blue Archive commands' })
export class BlueArchiveSync {
  @SlashGroup('buruaka')
  @Slash({ name: 'server-status', description: "Get server's current status" })
  async syncAll(
    @SlashChoice(
      ...Object.entries(BlueArchiveConstants.REGIONS).map(([key, value]) => Object({ name: key, value: value })),
    )
    @SlashOption({
      description: 'Choose server',
      name: 'server',
      required: true,
      type: ApplicationCommandOptionType.Number,
    })
    regionId: number,
    interaction: CommandInteraction,
  ): Promise<any> {
    await interaction.deferReply();
    const config: IConfig | undefined = cache.get('BA_Common');

    if (!config) return editOrReplyThenDelete(interaction, '❌ Cache not found.');

    const region = config.Regions[regionId];

    region.studentsCount = await getData.getStudentCount(regionId);
    region.raidsCount = await getData.getRaidCount(regionId);
    region.eventsCount = region.Events.length;
    region.rerunEventsCount = region.Events.filter((event: number) => /^10/.test(event.toString())).length;
    region.incomingBirthdayStudents = await getData.getStudentHasBirthdayNextWeek(regionId);

    const raids: Array<CurrentRaid & { info?: any }> = region.CurrentRaid.filter(
      (region) => region.raid.toString().length < 4,
    );
    const timeAttacks: Array<CurrentRaid & { info?: any }> = region.CurrentRaid.filter(
      (region) => region.raid.toString().length >= 4,
    );
    let raidPromises: Array<Promise<any>> = [];
    raids.forEach((raid, index, raidArray) => {
      raidPromises.push(
        getData.getRaidById(raid.raid).then((raidInfo) => {
          if (raidInfo) raidArray[index].info = raidInfo;
        }),
      );
    });
    timeAttacks.forEach((timeAttack, index, timeAttackArray) => {
      raidPromises.push(
        getData.getTimeAttackById(timeAttack.raid).then((raidInfo) => {
          if (raidInfo) timeAttackArray[index].info = raidInfo;
        }),
      );
    });

    await Promise.all(raidPromises);

    const gachaPromises: Array<Promise<any>> = [];

    region.CurrentGacha.forEach((gacha: CurrentGacha, index: number, characterArray: any) => {
      gachaPromises.push(
        getData.getStudentByIds(gacha.characters).then((students: Array<IStudent>) => {
          if (students.length > 0) characterArray[index].characters = students;
        }),
      );
    });

    await Promise.all(gachaPromises);

    const embed = BA_ServerEmbed(region, interaction.user);

    return await interaction.editReply({ embeds: [embed] });
  }
}
