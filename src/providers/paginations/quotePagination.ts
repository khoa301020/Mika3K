import { Pagination, PaginationItem, PaginationType } from '@discordx/pagination';
import { ButtonStyle, CommandInteraction, Message } from 'discord.js';
import { SimpleCommandMessage } from 'discordx';

export const QuoteCommandPagination = (
  command: SimpleCommandMessage,
  pages: Array<PaginationItem>,
  display = true,
): Pagination => {
  return new Pagination(
    command.message,
    pages,
    Object.assign(
      {
        type: PaginationType.Button,
        showStartEnd: true,
        enableExit: !!display,
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
    ),
  );
};

export const QuoteSlashPagination = (
  interaction: CommandInteraction,
  pages: Array<PaginationItem>,
  display = true,
): Pagination => {
  return new Pagination(
    interaction,
    pages,
    Object.assign(
      {
        type: PaginationType.Button,
        showStartEnd: true,
        enableExit: !!display,
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
    ),
  );
};
