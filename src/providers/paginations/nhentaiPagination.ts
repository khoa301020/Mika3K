import { Pagination, PaginationItem, PaginationOptions, PaginationType } from '@discordx/pagination';
import { ButtonInteraction, ButtonStyle, CommandInteraction, Message } from 'discord.js';
import { SimpleCommandMessage } from 'discordx';

export const NHentai_Pagination = (
  sendTo: CommandInteraction | ButtonInteraction | SimpleCommandMessage,
  pages: Array<PaginationItem>,
  type: 'button' | 'menu',
  labels: Array<string>,
  ephemeral = true,
): Pagination => {
  const options: PaginationOptions = Object.assign(
    {
      type: type === 'menu' ? PaginationType.SelectMenu : PaginationType.Button,
      showStartEnd: true,
      enableExit: !ephemeral,
      ephemeral: ephemeral,
    },
    type === 'menu' && {
      placeholder: 'Please select...',
      pageText: labels,
    },
    type === 'button' && {
      start: { label: '⏮️' },
      previous: { label: '◀️' },
      next: { label: '▶️' },
      end: { label: '⏩' },
      exit: { label: '❌', style: ButtonStyle.Danger },
    },
    !ephemeral && {
      async onTimeout(page: number, message: Message) {
        await message.edit({ components: [] });
      },
    },
  );
  return new Pagination(sendTo instanceof SimpleCommandMessage ? sendTo.message : sendTo, pages, options);
};
