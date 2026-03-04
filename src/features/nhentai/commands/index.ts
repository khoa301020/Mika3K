import { NHentaiConfigCommands } from './nhentai-config.commands';
import { NHentaiSearchCommands } from './nhentai-search.commands';

export { NHentaiConfigCommands, NHentaiSearchCommands };

export const NHentaiCommandProviders = [
  NHentaiSearchCommands,
  NHentaiConfigCommands,
];
