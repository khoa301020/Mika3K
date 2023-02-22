import { Pagination, PaginationItem, PaginationOptions, PaginationType } from '@discordx/pagination';
import { ButtonInteraction, ButtonStyle, CommandInteraction, Message } from 'discord.js';

export const MAL_ButtonPagination = (
  interaction: CommandInteraction,
  pages: Array<PaginationItem>,
  display = true,
): Pagination => {
  return new Pagination(interaction, pages, {
    type: PaginationType.Button,
    showStartEnd: true,
    enableExit: display,
    ephemeral: !display,
    start: { label: '⏮️' },
    previous: { label: '◀️' },
    next: { label: '▶️' },
    end: { label: '⏩' },
    exit: { label: '❌', style: ButtonStyle.Danger },
    onTimeout(page: number, message: Message) {
      message.edit({ components: [] });
    },
  });
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
  );
  return new Pagination(interaction, pages, options);
};
