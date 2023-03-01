import { Pagination, PaginationItem, PaginationOptions, PaginationType } from '@discordx/pagination';
import { ButtonStyle, CommandInteraction, Message } from 'discord.js';
import { SimpleCommandMessage } from 'discordx';

export const SauceNAO_SlashPagination = (
  interaction: CommandInteraction,
  pages: Array<PaginationItem>,
  display: boolean = true,
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

export const SauceNAO_CommandPagination = (
  command: SimpleCommandMessage,
  pages: Array<PaginationItem>,
  display: boolean = true,
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
  return new Pagination(command.message, pages, options);
};
