import { dirname, importx } from '@discordx/importer';
import { Koa } from '@discordx/koa';
import type { Interaction, Message } from 'discord.js';
import { IntentsBitField } from 'discord.js';
import { Client } from 'discordx';
import NodeCache from 'node-cache';

import axios from 'axios';
import { config } from 'dotenv';
import mongoose from 'mongoose';
import { errorHandler } from './utils/index.js';
config();
export const botPrefix = process.env.BOT_PREFIX ?? '$';
export const cache = new NodeCache();

export const bot = new Client({
  // To use only guild command
  // botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],

  // Discord intents
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildMessageReactions,
    IntentsBitField.Flags.GuildVoiceStates,
    IntentsBitField.Flags.MessageContent,
  ],

  // Debug logs are disabled in silent mode
  silent: true,

  // Configuration for @SimpleCommand
  simpleCommand: {
    prefix: botPrefix,
  },
});

// Connect MongoDB
mongoose.set('strictQuery', true);
const mongoUri = process.env.MONGO_URI;
await mongoose.connect(mongoUri!).then(async () => {
  // axios.defaults.headers.common['Accept-Encoding'] = 'gzip';
  cache.set('init', true);
  console.log('MongoDB connected');
});

bot.once('ready', async () => {
  // Make sure all guilds are cached
  await bot.guilds.fetch();

  // Synchronize applications commands with Discord
  await bot.initApplicationCommands();

  // To clear all guild commands, uncomment this line,
  // This is useful when moving from guild commands to global commands
  // It must only be executed once
  //
  //  await bot.clearApplicationCommands(
  //    ...bot.guilds.cache.map((g) => g.id)
  //  );

  console.log(`Bot started, env: ${process.env.BOT_ENV}`);
});

process.on('unhandledRejection', (error: Error) => {
  errorHandler(error);
});

process.on('uncaughtException', (error: Error) => {
  errorHandler(error);
});

bot.on('interactionCreate', (interaction: Interaction) => {
  bot.executeInteraction(interaction);
});

bot.on('messageCreate', (message: Message) => {
  bot.executeCommand(message);
});

async function run() {
  // The following syntax should be used in the commonjs environment
  //
  // await importx(__dirname + "/{events,commands,api}/**/*.{ts,js}");

  // The following syntax should be used in the ECMAScript environment
  await importx(`${dirname(import.meta.url)}/{events,commands,api}/**/*.{ts,js}`);

  // Let's start the bot
  if (!process.env.BOT_TOKEN) {
    throw Error('Could not find BOT_TOKEN in your environment');
  }

  // Log in with your bot token
  await bot.login(process.env.BOT_TOKEN);

  // ************* rest api section **********

  // api: prepare server
  const server = new Koa();

  // api: need to build the api server first
  await server.build();

  // api: let's start the server now
  const port = process.env.PORT ?? 3000;
  server.listen(port, async () => {
    const serverIp = await axios.get('https://api.ipify.org?format=json').then((res) => res.data.ip);
    console.log(`discord api server started on port ${port}. Public ip: ${serverIp}`);
    console.log(`visit ${serverIp}:${port}/guilds`);
  });
}

// TODO: Gelbooru/Danbooru search img
// TODO: Starboard to highlights
// TODO: Auto certain meme in channel in specific time
// TODO: Message history
// TODO: NHentai bypass cloudflare with flaresolver
// TODO: Poll
// TODO: Ultility command to tell bot edit its msg, react, say sth, set role, delete a certain msg, or show msg in channels
// TODO: Use discord timestamp indicator to ultilize bot functions
run();
