import { APIEmbedField, EmbedBuilder } from 'discord.js';
import HoYoLABConstants from '../../constants/hoyolab.js';
import { bot } from '../../main.js';
import {
  IHoYoLAB,
  IHoYoLABGameAccount,
  INoteGenshinData,
  INoteHSRData,
  IRedeemResult,
  THoyoGame,
} from '../../types/hoyolab';
import { getRelativeTime } from '../../utils/index.js';

export const HoYoLABInfoEmbed = (user: IHoYoLAB): EmbedBuilder => {
  return new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(`Your HoYoLAB info`)
    .addFields(
      ...user.hoyoUsers.map(
        (account): APIEmbedField => ({
          name: account.remark,
          value: account.gameAccounts
            .map((gameAccount: IHoYoLABGameAccount) => {
              return `- [${gameAccount.game?.toUpperCase()}${gameAccount.game_uid}] ${gameAccount.nickname}`;
            })
            .join('\n'),
        }),
      ),
    )
    .setTimestamp()
    .setFooter({ text: `${bot.user?.displayName}`, iconURL: bot.user!.displayAvatarURL() });
};

export const HoYoLABRedeemResultEmbed = (
  results: Array<{
    giftcode: string | undefined;
    result: Array<IRedeemResult>;
  }>,
): EmbedBuilder => {
  const fields: Array<APIEmbedField> = [];

  for (const [key, result] of Object.entries(results))
    fields.push({
      name: `Giftcode ${parseInt(key) + 1}: ${result.giftcode}`,
      value: result.result
        .map((res: IRedeemResult) => {
          const accounts = res.accounts.map((account) => {
            if (Number.isInteger(account.code)) {
              switch (account.code) {
                case 0: // Success
                  return ` - [${account.uid}] ${account.nickname} ✅`;
                case -2017: // HSR
                  return ` - [${account.uid}] ${account.nickname} ⏺`;
                case -5003: // Genshin
                  return ` - [${account.uid}] ${account.nickname} ⏺`;
                default:
                  return ` - [${account.uid}] ${account.nickname} ❌`;
              }
            } else {
              return ` - [${account.uid}] ${account.nickname} - ❌`;
            }
          });
          return `${res.remark}\n${accounts.join('\n')}`;
        })
        .join('\n'),
    });

  return new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(`Redeem result`)
    .addFields(fields)
    .setTimestamp()
    .setFooter({ text: `${bot.user?.displayName}`, iconURL: bot.user!.displayAvatarURL() });
};

export const HoYoLABNoteEmbed = (
  note: INoteHSRData | INoteGenshinData,
  game: Exclude<THoyoGame, 'hi3'>,
): EmbedBuilder => {
  let description = '';

  switch (game) {
    case 'genshin':
      note = note as INoteGenshinData;
      description = `- Daily Missions: ${note.finished_task_num}/${note.total_task_num}${
        note.is_extra_task_reward_received ? ' ✅' : ''
      }\n- Expedition: ${note.current_expedition_num}/${note.max_expedition_num}\n- Transformer: ${
        !note.transformer.obtained
          ? "**Haven't obtained**"
          : note.transformer.recovery_time.reached
          ? '**Ready**'
          : `In **${note.transformer.recovery_time.Day ? `${note.transformer.recovery_time.Day}d ` : ''}${
              note.transformer.recovery_time.Hour ? `${note.transformer.recovery_time.Hour}h ` : ''
            }${note.transformer.recovery_time.Minute ? `${note.transformer.recovery_time.Minute}m ` : ''}${
              note.transformer.recovery_time.Second ? `${note.transformer.recovery_time.Second}s ` : ''
            }**`
      }\n- Resin: ${note.current_resin}/${note.max_resin} - **${getRelativeTime(
        parseInt(note.resin_recovery_time),
      )}**\n- Serenitea Pot: ${note.current_home_coin}/${note.max_home_coin} - **${getRelativeTime(
        parseInt(note.home_coin_recovery_time),
      )}**`;
      break;
    case 'hsr':
      note = note as INoteHSRData;
      description = `- Daily Missions: ${note.current_train_score}/${note.max_train_score}\n- Simulated Universe: ${
        note.current_rogue_score
      }/${note.max_rogue_score}\n- Echo of War: ${note.weekly_cocoon_cnt}/${note.weekly_cocoon_limit}\n- Stamina: ${
        note.current_stamina
      }/${note.max_stamina} - **${getRelativeTime(note.stamina_recover_time)}**\n- Expedition: ${
        note.expeditions.length === 0
          ? 'Currently no expedition'
          : '\n - ' +
            note.expeditions
              .map((expedition) => {
                return `[*${expedition.status}*] ${expedition.name} - **${getRelativeTime(
                  expedition.remaining_time,
                )}**`;
              })
              .join('\n - ')
      }`;
      break;
  }

  return new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(`[${note.id}] ${note.nickname}'s ${HoYoLABConstants.REDEEM_TARGET[game].name} note`)
    .setDescription(description)
    .setTimestamp()
    .setFooter({ text: `${bot.user?.displayName}`, iconURL: bot.user!.displayAvatarURL() });
};
