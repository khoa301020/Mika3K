import { CheckInfoCommands } from './check-info.commands';
import { CurrencyCommands } from './currency.commands';
import { HelpCommands } from './help.commands';
import { MathCommands } from './math.commands';
import { PickCommands } from './pick.commands';
import { SaucenaoCommands } from './saucenao.commands';

export { CheckInfoCommands, CurrencyCommands, HelpCommands, MathCommands, PickCommands, SaucenaoCommands };

export const MiscCommandProviders = [
  MathCommands,
  PickCommands,
  SaucenaoCommands,
  CheckInfoCommands,
  CurrencyCommands,
  HelpCommands,
];
