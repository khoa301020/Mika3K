import { Pagination, PaginationItem, PaginationOptions } from '@discordx/pagination';
import { ButtonInteraction, ButtonStyle, CommandInteraction, Message } from 'discord.js';
import { SimpleCommandMessage } from 'discordx';
import { TPaginationType } from '../types/common';

export const commonPagination = (
  sendTo: CommandInteraction | ButtonInteraction | SimpleCommandMessage,
  pages: Array<PaginationItem>,
  type: TPaginationType,
  ephemeral = true,
  labels?: Array<string>,
): Pagination => {
  const options: PaginationOptions = Object.assign(
    {
      showStartEnd: true,
      enableExit: !ephemeral,
      ephemeral: ephemeral,
    },
    type === 'menu' && {
      selectMenu: { disabled: false },
      placeholder: 'Please select...',
    },
    type === 'menu' &&
    labels && {
      pageText: labels,
    },
    type === 'button' && {
      buttons: { disabled: false },
      start: { label: '⏮️' },
      previous: { label: '◀️' },
      next: { label: '▶️' },
      end: { label: '⏩' },
      exit: { label: '❌', style: ButtonStyle.Danger },
    },
    !ephemeral && {
      async onTimeout(page: number, message: Message) {
        const afterTimeoutMessage = (await message.channel.messages.fetch()).get(message.id);
        if (afterTimeoutMessage && afterTimeoutMessage.editable) await message.edit({ components: [] });
      },
    },
  );
  return new Pagination(sendTo instanceof SimpleCommandMessage ? sendTo.message : sendTo, pages, options);
};
