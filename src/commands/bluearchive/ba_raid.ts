import { ApplicationCommandOptionType, CommandInteraction } from 'discord.js';
import { Discord, Slash, SlashChoice, SlashGroup, SlashOption } from 'discordx';
import { BlueArchiveConstants, SystemMessages } from '../../constants/index.js';
import { BA_RaidEmbed } from '../../providers/embeds/bluearchiveEmbed.js';
import { getData } from '../../services/bluearchive.js';
import { editOrReplyThenDelete } from '../../utils/index.js';

@Discord()
@SlashGroup({ name: 'buruaka', description: 'Blue Archive commands' })
export class BlueArchiveSync {
  @SlashGroup('buruaka')
  @Slash({ name: 'raid', description: 'Search raid' })
  async syncAll(
    @SlashOption({
      description: 'Public display?',
      name: 'display',
      required: true,
      type: ApplicationCommandOptionType.Boolean,
    })
    isPublic: boolean,
    @SlashChoice(
      ...Object.entries(BlueArchiveConstants.RAIDS).map(([key, value]) => Object({ name: key, value: value })),
    )
    @SlashOption({
      description: 'Select raid',
      name: 'raid',
      required: true,
      type: ApplicationCommandOptionType.Number,
    })
    raidId: number,
    @SlashChoice(...Object.keys(BlueArchiveConstants.RAID_DIFFICULTIES))
    @SlashOption({
      description: 'Select raid\'s difficulty',
      name: 'raid-difficulty',
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    raidDifficulty: string,
    interaction: CommandInteraction,
  ): Promise<any> {
    await interaction.deferReply({ ephemeral: !isPublic });

    const raid = await getData.getRaidById(raidId);

    if (!raid) return await editOrReplyThenDelete(interaction, SystemMessages.error('BA_RAID_NOT_FOUND'));
    if (BlueArchiveConstants.RAID_DIFFICULTIES[raidDifficulty] > raid.MaxDifficulty[0])
      return await interaction.editReply(
        SystemMessages.error('BA_RAID_DIFFICULTY_UNAVAILABLE', raidDifficulty, raid.Name).toString()
      );

    const embed = BA_RaidEmbed(raid, raidDifficulty, interaction.user);

    return await interaction.editReply({ embeds: [embed] });
  }
}
