import { Injectable } from '@nestjs/common';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  MessageActionRowComponentBuilder,
} from 'discord.js';
import { Context, SlashCommand, Button } from 'necord';
import type { SlashCommandContext, ButtonContext } from 'necord';

const truthTable = {
  Rock: { Rock: '🗿', Scissor: '🎉', Paper: '🚮' },
  Scissor: { Rock: '🚮', Scissor: '🗿', Paper: '🎉' },
  Paper: { Rock: '🎉', Scissor: '🚮', Paper: '🗿' },
};

const jankenponTable = ['Rock', 'Scissor', 'Paper'];

const rockBtn = new ButtonBuilder()
  .setLabel('🪨 Rock')
  .setStyle(ButtonStyle.Primary)
  .setCustomId('jkp_rock');
const paperBtn = new ButtonBuilder()
  .setLabel('📄 Paper')
  .setStyle(ButtonStyle.Primary)
  .setCustomId('jkp_paper');
const scissorBtn = new ButtonBuilder()
  .setLabel('✂️ Scissor')
  .setStyle(ButtonStyle.Primary)
  .setCustomId('jkp_scissor');
const restartBtn = new ButtonBuilder()
  .setLabel('✂️ Restart')
  .setStyle(ButtonStyle.Danger)
  .setCustomId('jkp_restart');

const playRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
  .addComponents(rockBtn)
  .addComponents(scissorBtn)
  .addComponents(paperBtn);

const finishRow =
  new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
    restartBtn,
  );

@Injectable()
export class MinigamesCommands {
  private randomArray<T>(arr: T[]): T[] {
    return [arr[Math.floor(Math.random() * arr.length)]];
  }

  @SlashCommand({
    name: 'jankenpon',
    description: 'Play Rock, Scissor, Paper!',
  })
  public async jankenpon(@Context() [interaction]: SlashCommandContext) {
    await interaction.reply({
      content: 'Rock, Scissor, Paper!',
      components: [playRow],
      fetchReply: true,
    });

    setTimeout(() => {
      interaction
        .editReply({ content: 'Rock, Scissor, Paper!', components: [] })
        .catch(() => {});
    }, 60 * 1000);
  }

  @Button('jkp_rock')
  public async onRockButton(@Context() [interaction]: ButtonContext) {
    await this.handleJkpPlay(interaction, 'Rock');
  }

  @Button('jkp_scissor')
  public async onScissorButton(@Context() [interaction]: ButtonContext) {
    await this.handleJkpPlay(interaction, 'Scissor');
  }

  @Button('jkp_paper')
  public async onPaperButton(@Context() [interaction]: ButtonContext) {
    await this.handleJkpPlay(interaction, 'Paper');
  }

  @Button('jkp_restart')
  public async onRestartButton(@Context() [interaction]: ButtonContext) {
    await interaction.message
      .edit({ content: interaction.message.content, components: [] })
      .catch(() => {});

    await interaction.reply({
      content: 'Rock, Scissor, Paper!',
      components: [playRow],
    });

    setTimeout(() => {
      interaction
        .editReply({ content: 'Rock, Scissor, Paper!', components: [] })
        .catch(() => {});
    }, 60 * 1000);
  }

  private async handleJkpPlay(
    interaction: ButtonInteraction,
    botChoice: 'Rock' | 'Scissor' | 'Paper',
  ) {
    const user = `${interaction.user.username}`;
    const resultValue = this.randomArray(jankenponTable)[0] as
      | 'Rock'
      | 'Scissor'
      | 'Paper';

    await interaction.message
      .edit({ content: 'Rock, Scissor, Paper!', components: [] })
      .catch(() => {});

    await interaction.reply({
      content: `${truthTable[botChoice][resultValue]} ${user}: ${resultValue} V.S Bot: ${botChoice}`,
      components: [finishRow],
    });

    setTimeout(() => {
      interaction
        .editReply({ content: 'Rock, Scissor, Paper!', components: [] })
        .catch(() => {});
    }, 60 * 1000);
  }
}
