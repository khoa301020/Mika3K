import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  CommandInteraction,
  MessageActionRowComponentBuilder,
} from 'discord.js';
import { ButtonComponent, Discord, SimpleCommand, SimpleCommandMessage, Slash, SlashGroup } from 'discordx';
import { randomArray } from '../../utils/index.js';

const truthTable = {
  Rock: { Rock: '🗿', Scissor: '🎉', Paper: '🚮' },
  Scissor: { Rock: '🚮', Scissor: '🗿', Paper: '🎉' },
  Paper: { Rock: '🎉', Scissor: '🚮', Paper: '🗿' },
};

const jankenponTable = ['Rock', 'Scissor', 'Paper'];

const rockBtn = new ButtonBuilder().setLabel('🪨 Rock').setStyle(ButtonStyle.Primary).setCustomId('rock');
const paperBtn = new ButtonBuilder().setLabel('📄 Paper').setStyle(ButtonStyle.Primary).setCustomId('paper');
const scissorBtn = new ButtonBuilder().setLabel('✂️ Scissor').setStyle(ButtonStyle.Primary).setCustomId('scissor');
const restartBtn = new ButtonBuilder().setLabel('✂️ Restart').setStyle(ButtonStyle.Danger).setCustomId('restart');

const playRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
  .addComponents(rockBtn)
  .addComponents(scissorBtn)
  .addComponents(paperBtn);

const finishRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(restartBtn);
@SlashGroup({ description: 'minigames', name: 'minigame' })
@Discord()
class JanKenPon {
  @SimpleCommand({ aliases: ['jankenpon', 'jkp'], description: 'Play Jankenpon' })
  jankenponCommand(command: SimpleCommandMessage): void {
    const rockBtn = new ButtonBuilder().setLabel('🪨 Rock').setStyle(ButtonStyle.Primary).setCustomId('rock');
    const scissorBtn = new ButtonBuilder().setLabel('✂️ Scissor').setStyle(ButtonStyle.Primary).setCustomId('scissor');
    const paperBtn = new ButtonBuilder().setLabel('📄 Paper').setStyle(ButtonStyle.Primary).setCustomId('paper');

    const row = new ActionRowBuilder<MessageActionRowComponentBuilder>()
      .addComponents(rockBtn)
      .addComponents(scissorBtn)
      .addComponents(paperBtn);

    command.message.reply({ content: 'Rock, Scissor, Paper!', components: [row] }).then((msg) => {
      setTimeout(() => msg.edit({ content: 'Rock, Scissor, Paper!', components: [] }), 60 * 1000);
    });
  }

  @SlashGroup('minigame')
  @Slash({ description: 'Rock, Scissor, Paper!', name: 'jankenpon' })
  async jankenponSlash(interaction: CommandInteraction): Promise<void> {
    interaction.reply({ content: 'Rock, Scissor, Paper!', components: [playRow] }).then((_) => {
      setTimeout(() => interaction.editReply({ content: 'Rock, Scissor, Paper!', components: [] }), 60 * 1000);
    });
  }

  @ButtonComponent({ id: 'rock' })
  async rockBtnComponent(interaction: ButtonInteraction): Promise<void> {
    const user = `${interaction.user.username}#${interaction.user.discriminator}`;
    const resultValue = randomArray(jankenponTable)[0] as keyof Object;

    await interaction.message.edit({ content: 'Rock, Scissor, Paper!', components: [] });

    interaction
      .reply({
        content: `${truthTable.Rock[resultValue]} ${user}: ${resultValue} V.S Bot: Rock`,
        components: [finishRow],
      })
      .then((_) => {
        setTimeout(() => interaction.editReply({ content: 'Rock, Scissor, Paper!', components: [] }), 60 * 1000);
      });
  }

  @ButtonComponent({ id: 'scissor' })
  async scissorBtnComponent(interaction: ButtonInteraction): Promise<Promise<void>> {
    const user = `${interaction.user.username}#${interaction.user.discriminator}`;
    const resultValue = randomArray(jankenponTable)[0] as keyof Object;

    await interaction.message.edit({ content: 'Rock, Scissor, Paper!', components: [] });

    interaction
      .reply({
        content: `${truthTable.Scissor[resultValue]} ${user}: ${resultValue} V.S Bot: Scissor`,
        components: [finishRow],
      })
      .then((_) => {
        setTimeout(() => interaction.editReply({ content: 'Rock, Scissor, Paper!', components: [] }), 60 * 1000);
      });
  }

  @ButtonComponent({ id: 'paper' })
  async paperBtnComponent(interaction: ButtonInteraction): Promise<Promise<void>> {
    const user = `${interaction.user.username}#${interaction.user.discriminator}`;
    const resultValue = randomArray(jankenponTable)[0] as keyof Object;

    await interaction.message.edit({ content: 'Rock, Scissor, Paper!', components: [] });

    interaction
      .reply({
        content: `${truthTable.Paper[resultValue]} ${user}: ${resultValue} V.S Bot: Paper`,
        components: [finishRow],
      })
      .then((_) => {
        setTimeout(() => interaction.editReply({ content: 'Rock, Scissor, Paper!', components: [] }), 60 * 1000);
      });
  }

  @ButtonComponent({ id: 'restart' })
  async restartBtnComponent(interaction: ButtonInteraction): Promise<Promise<void>> {
    await interaction.message.edit({ content: interaction.message.content, components: [] });

    interaction.reply({ content: 'Rock, Scissor, Paper!', components: [playRow] }).then((_) => {
      setTimeout(() => interaction.editReply({ content: 'Rock, Scissor, Paper!', components: [] }), 60 * 1000);
    });
  }
}
