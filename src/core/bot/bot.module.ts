import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IntentsBitField, Partials } from 'discord.js';
import { NecordModule } from 'necord';
import { BotGateway } from './bot.gateway';

@Module({
  imports: [
    NecordModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        token: configService.get<string>('BOT_TOKEN')!,
        prefix: configService.get<string>('BOT_PREFIX') || '$',
        intents: [
          IntentsBitField.Flags.Guilds,
          IntentsBitField.Flags.GuildMembers,
          IntentsBitField.Flags.GuildMessages,
          IntentsBitField.Flags.GuildMessageReactions,
          IntentsBitField.Flags.GuildVoiceStates,
          IntentsBitField.Flags.MessageContent,
          IntentsBitField.Flags.DirectMessages,
          IntentsBitField.Flags.DirectMessageReactions,
        ],
        partials: [Partials.Channel, Partials.Message],
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [BotGateway],
  exports: [NecordModule],
})
export class BotModule {}
