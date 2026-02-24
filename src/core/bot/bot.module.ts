import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NecordModule } from 'necord';
import { IntentsBitField } from 'discord.js';
import { BotGateway } from './bot.gateway';

@Module({
  imports: [
    NecordModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        token: configService.get<string>('BOT_TOKEN')!,
        intents: [
          IntentsBitField.Flags.Guilds,
          IntentsBitField.Flags.GuildMembers,
          IntentsBitField.Flags.GuildMessages,
          IntentsBitField.Flags.GuildMessageReactions,
          IntentsBitField.Flags.GuildVoiceStates,
          IntentsBitField.Flags.MessageContent,
        ],
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [BotGateway],
  exports: [NecordModule],
})
export class BotModule {}
