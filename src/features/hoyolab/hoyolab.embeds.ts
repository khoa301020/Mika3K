import { Injectable } from '@nestjs/common';
import { APIEmbedField, EmbedBuilder } from 'discord.js';
import {
  IHoYoLAB,
  IHoYoLABGameAccount,
  INoteGenshinData,
  INoteHSRData,
  THoyoGame,
  IAccountRedeemState,
} from './types/hoyolab';
import { Client } from 'discord.js';
// removed InjectDiscordClient

@Injectable()
export class HoyolabEmbeds {
  constructor(private readonly client: Client) {}

  public info(user: IHoYoLAB): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(`Your HoYoLAB info`)
      .addFields(
        ...user.hoyoUsers.map(
          (account): APIEmbedField => ({
            name: account.remark!,
            value: account.gameAccounts
              .map((gameAccount: IHoYoLABGameAccount) => {
                return `- [${gameAccount.game?.toUpperCase()}${gameAccount.game_uid}] ${gameAccount.nickname}`;
              })
              .join('\n'),
          }),
        ),
      )
      .setTimestamp()
      .setFooter({
        text: `${this.client.user?.displayName || 'Mika3K'}`,
        iconURL: this.client.user?.displayAvatarURL(),
      });
  }

  public redeemProgressEmbeds(
    states: Array<IAccountRedeemState>,
    totalCodes: number,
  ): Array<EmbedBuilder> {
    const embeds: Array<EmbedBuilder> = [];

    for (const state of states) {
      const emptyBlocks = totalCodes - state.blocks.length;
      const progressBlocks =
        state.blocks.join('') + '⬜'.repeat(Math.max(0, emptyBlocks));

      // Choose color based on the last block status if any, else generic blue
      let color = 0x0099ff;
      if (state.blocks.length > 0) {
        const lastBlock = state.blocks[state.blocks.length - 1];
        if (lastBlock === '🟩')
          color = 0x00ff00; // Success green
        else if (lastBlock === '🟨')
          color = 0xffff00; // Warning yellow
        else if (lastBlock === '🟥') color = 0xff0000; // Error red
      }

      const embed = new EmbedBuilder()
        .setColor(color)
        .setAuthor({
          name: `[${(state.game || 'UNKNOWN').toUpperCase()}${state.uid}] ${state.nickname}`,
        })
        .setDescription(
          `> ${progressBlocks} **${state.blocks.length}/${totalCodes}**\n\n> ${state.statusText}`,
        );

      embeds.push(embed);
    }

    if (embeds.length > 0) {
      embeds[embeds.length - 1].setTimestamp().setFooter({
        text: `${this.client.user?.displayName || 'Mika3K'}`,
        iconURL: this.client.user?.displayAvatarURL(),
      });
    }

    return embeds;
  }

  public note(
    note: INoteHSRData | INoteGenshinData,
    game: Exclude<THoyoGame, 'hi3'>,
  ): EmbedBuilder {
    let description = '';

    const getRelative = (seconds: number | string) => {
      const ms = parseInt(seconds as string, 10) * 1000;
      return `<t:${Math.floor((Date.now() + ms) / 1000)}:R>`;
    };

    switch (game) {
      case 'genshin': {
        const n = note as INoteGenshinData;
        description = `- Daily Missions: ${n.finished_task_num}/${n.total_task_num}${
          n.is_extra_task_reward_received ? ' ✅' : ''
        }\n- Expedition: ${n.current_expedition_num}/${n.max_expedition_num}\n- Transformer: ${
          !n.transformer.obtained
            ? "**Haven't obtained**"
            : n.transformer.recovery_time.reached
              ? '**Ready**'
              : `In **${n.transformer.recovery_time.Day ? `\${n.transformer.recovery_time.Day}d ` : ''}${
                  n.transformer.recovery_time.Hour
                    ? `\${n.transformer.recovery_time.Hour}h `
                    : ''
                }${n.transformer.recovery_time.Minute ? `\${n.transformer.recovery_time.Minute}m ` : ''}${
                  n.transformer.recovery_time.Second
                    ? `\${n.transformer.recovery_time.Second}s `
                    : ''
                }**`
        }\n- Resin: ${n.current_resin}/${n.max_resin} - **${getRelative(
          n.resin_recovery_time,
        )}**\n- Serenitea Pot: ${n.current_home_coin}/${n.max_home_coin} - **${getRelative(
          n.home_coin_recovery_time,
        )}**`;
        break;
      }
      case 'hsr': {
        const n = note as INoteHSRData;
        description = `- Daily Missions: ${n.current_train_score}/${n.max_train_score}\n- Simulated Universe: ${
          n.current_rogue_score
        }/${n.max_rogue_score}\n- Echo of War: ${n.weekly_cocoon_cnt}/${n.weekly_cocoon_limit}\n- Stamina: ${
          n.current_stamina
        }/${n.max_stamina} - **${getRelative(n.stamina_recover_time)}**\n- Expedition: ${
          n.expeditions.length === 0
            ? 'Currently no expedition'
            : '\n - ' +
              n.expeditions
                .map((expedition) => {
                  return `[*${expedition.status}*] ${expedition.name} - **${getRelative(
                    expedition.remaining_time,
                  )}**`;
                })
                .join('\n - ')
        }`;
        break;
      }
    }

    return new EmbedBuilder()
      .setColor(0x0099ff)
      .setDescription(description)
      .setTimestamp()
      .setFooter({
        text: `${this.client.user?.displayName || 'Mika3K'}`,
        iconURL: this.client.user?.displayAvatarURL(),
      });
  }
}
