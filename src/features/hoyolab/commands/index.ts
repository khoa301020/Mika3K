import { HoyolabAccountCommands } from './hoyolab-account.commands';
import { HoyolabRedeemCommands } from './hoyolab-redeem.commands';

export { HoyolabAccountCommands, HoyolabRedeemCommands };

export const HoyolabCommandProviders = [
  HoyolabAccountCommands,
  HoyolabRedeemCommands,
];
