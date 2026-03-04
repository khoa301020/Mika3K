import { AnimeCommands } from './anime.commands';
import { CharacterCommands } from './character.commands';
import { MangaCommands } from './manga.commands';
import { PeopleCommands } from './people.commands';

export { AnimeCommands, CharacterCommands, MangaCommands, PeopleCommands };

export const MalCommandProviders = [
  AnimeCommands,
  MangaCommands,
  CharacterCommands,
  PeopleCommands,
];
