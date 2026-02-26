import { Injectable } from '@nestjs/common';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
  EmbedBuilder,
  Message,
  StringSelectMenuBuilder,
  ComponentType,
  MessageFlags,
  InteractionReplyOptions,
  InteractionEditReplyOptions,
} from 'discord.js';
import type { ButtonInteraction } from 'discord.js';

export interface PaginationPage {
  embeds: EmbedBuilder[];
  content?: string;
}

export type PaginationType = 'button' | 'menu';

export interface PaginationOptions {
  type?: PaginationType;
  ephemeral?: boolean;
  showStartEnd?: boolean;
  enableExit?: boolean;
  timeout?: number;
  labels?: string[];
}

@Injectable()
export class PaginationService {
  async paginate(
    interaction: CommandInteraction | ButtonInteraction,
    pages: PaginationPage[],
    options: PaginationOptions = {},
  ): Promise<void> {
    const {
      type = 'button',
      ephemeral = true,
      showStartEnd = true,
      enableExit = !ephemeral,
      timeout = 120_000,
      labels,
    } = options;

    if (pages.length === 0) return;

    if (pages.length === 1) {
      if (interaction.replied || interaction.deferred) {
        await interaction.editReply({ ...pages[0] });
      } else {
        await interaction.reply({
          ...pages[0],
          flags: ephemeral ? [MessageFlags.Ephemeral] : undefined,
        });
      }
      return;
    }

    let currentPage = 0;

    const getComponents = () =>
      type === 'menu'
        ? this.buildMenuRow(pages, currentPage, labels)
        : this.buildButtonRow(pages, currentPage, showStartEnd, enableExit);

    let message: Message;

    if (interaction.replied || interaction.deferred) {
      const options: InteractionEditReplyOptions = {
        ...pages[currentPage],
        components: [getComponents()],
      };
      message = await interaction.editReply(options);
    } else {
      const options: InteractionReplyOptions = {
        ...pages[currentPage],
        components: [getComponents()],
        flags: ephemeral ? [MessageFlags.Ephemeral] : undefined,
        fetchReply: true,
      };
      message = (await interaction.reply(options)) as unknown as Message;
    }

    if (!(message instanceof Message)) return;

    const collector = message.createMessageComponentCollector({
      time: timeout,
      componentType:
        type === 'menu' ? ComponentType.StringSelect : ComponentType.Button,
    });

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    collector.on('collect', async (i: any) => {
      if (i.user.id !== interaction.user.id) {
        await i.reply({
          content: 'This is not your interaction.',
          flags: [MessageFlags.Ephemeral],
        });
        return;
      }

      if (i.isStringSelectMenu?.()) {
        currentPage = parseInt(i.values[0], 10);
      } else {
        switch (i.customId) {
          case 'pg_first':
            currentPage = 0;
            break;
          case 'pg_prev':
            currentPage = Math.max(0, currentPage - 1);
            break;
          case 'pg_next':
            currentPage = Math.min(pages.length - 1, currentPage + 1);
            break;
          case 'pg_last':
            currentPage = pages.length - 1;
            break;
          case 'pg_exit':
            collector.stop();
            await i.update({ components: [] });
            return;
        }
      }

      await i.update({ ...pages[currentPage], components: [getComponents()] });
    });

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    collector.on('end', async () => {
      if (message.editable) {
        await message.edit({ components: [] }).catch(() => {});
      }
    });
  }

  private buildButtonRow(
    pages: PaginationPage[],
    current: number,
    showStartEnd: boolean,
    enableExit: boolean,
  ): ActionRowBuilder<ButtonBuilder> {
    const row = new ActionRowBuilder<ButtonBuilder>();

    if (showStartEnd) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId('pg_first')
          .setLabel('⏮️')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(current === 0),
      );
    }

    row.addComponents(
      new ButtonBuilder()
        .setCustomId('pg_prev')
        .setLabel('◀️')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(current === 0),
      new ButtonBuilder()
        .setCustomId('pg_next')
        .setLabel('▶️')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(current === pages.length - 1),
    );

    if (showStartEnd) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId('pg_last')
          .setLabel('⏩')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(current === pages.length - 1),
      );
    }

    if (enableExit) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId('pg_exit')
          .setLabel('❌')
          .setStyle(ButtonStyle.Danger),
      );
    }

    return row;
  }

  private buildMenuRow(
    pages: PaginationPage[],
    current: number,
    labels?: string[],
  ): ActionRowBuilder<StringSelectMenuBuilder> {
    const menu = new StringSelectMenuBuilder()
      .setCustomId('pg_menu')
      .setPlaceholder('Please select...');

    pages.forEach((_, index) => {
      menu.addOptions({
        label: labels?.[index] ?? `Page ${index + 1}`,
        value: index.toString(),
        default: index === current,
      });
    });

    return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);
  }
}
