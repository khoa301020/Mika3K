import { SyosetuFollowCommands } from './syosetu-follow.commands';
import { SyosetuGenresCommands } from './syosetu-genres.commands';
import { SyosetuSearchCommands } from './syosetu-search.commands';

export { SyosetuFollowCommands, SyosetuGenresCommands, SyosetuSearchCommands };

export const SyosetuCommandProviders = [
  SyosetuSearchCommands,
  SyosetuFollowCommands,
  SyosetuGenresCommands,
];
