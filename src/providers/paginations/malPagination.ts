import { Pagination, PaginationItem, PaginationType } from '@discordx/pagination';
import { ButtonStyle, CommandInteraction } from 'discord.js';

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
  });
};

export const MAL_SelectMenuPagination = (
  interaction: CommandInteraction,
  pages: Array<PaginationItem>,
  display = true,
  names: Array<string> = [],
): Pagination => {
  const options = Object.assign(
    {
      type: PaginationType.SelectMenu,
      showStartEnd: false,
      enableExit: display,
      ephemeral: !display,
      placeholder: 'Select anime...',
    },
    names.length > 0 && { pageText: names },
  );
  return new Pagination(interaction, pages, options);
};
