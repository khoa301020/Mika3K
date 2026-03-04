import { NotifyCommands } from './notify.commands';
import { RaidCommands } from './raid.commands';
import { ServerStatusCommands } from './serverstatus.commands';
import { StudentCommands } from './student.commands';

export { NotifyCommands, RaidCommands, ServerStatusCommands, StudentCommands };

export const BaCommandProviders = [
  StudentCommands,
  RaidCommands,
  ServerStatusCommands,
  NotifyCommands,
];
