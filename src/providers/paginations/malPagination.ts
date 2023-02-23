import { Pagination, PaginationItem, PaginationOptions, PaginationType } from '@discordx/pagination';
import { ButtonInteraction, ButtonStyle, CommandInteraction, Message } from 'discord.js';

export const MAL_ButtonPagination = (
  interaction: CommandInteraction,
  pages: Array<PaginationItem>,
  display = true,
): Pagination => {
  const options: PaginationOptions = Object.assign(
    {
      type: PaginationType.Button,
      showStartEnd: true,
      enableExit: display,
      ephemeral: !display,
      start: { label: '⏮️' },
      previous: { label: '◀️' },
      next: { label: '▶️' },
      end: { label: '⏩' },
      exit: { label: '❌', style: ButtonStyle.Danger },
    },
    display && {
      async onTimeout(page: number, message: Message) {
        await message.edit({ components: [] });
      },
    },
  );
  return new Pagination(interaction, pages, options);
};

export const MAL_SelectMenuPagination = (
  interaction: CommandInteraction | ButtonInteraction,
  pages: Array<PaginationItem>,
  display = true,
  names: Array<string> = [],
): Pagination => {
  const options: PaginationOptions = Object.assign(
    {
      type: PaginationType.SelectMenu,
      showStartEnd: false,
      enableExit: display,
      ephemeral: !display,
      placeholder: 'Please select...',
    },
    names.length > 0 && { pageText: names },
    display && {
      async onTimeout(page: number, message: Message) {
        await message.edit({ components: [] });
      },
    },
  );
  return new Pagination(interaction, pages, options);
};
