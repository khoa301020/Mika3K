import { StringOption, UserOption } from 'necord';

export enum TrackEditAction {
  ADD = 'add',
  REMOVE = 'remove',
  ADD_CHANNEL = 'add-channel',
  REMARK = 'remark',
}

export class TrackDto {
  @StringOption({
    name: 'code',
    description: 'Tracking code (e.g. SPXVN062281815032)',
    required: true,
  })
  code: string;

  @StringOption({
    name: 'remark',
    description: 'A label/remark for this shipment (e.g. Honor M7P)',
    required: true,
  })
  remark: string;

  @UserOption({
    name: 'broadcast_to',
    description: 'User to broadcast tracking updates to (watchalong)',
    required: false,
  })
  broadcastTo?: any;
}

export class UntrackDto {
  @StringOption({
    name: 'tracking_code',
    description: 'The tracking code to stop tracking',
    required: true,
  })
  trackingCode: string;
}

export class TrackInfoDto {
  @StringOption({
    name: 'tracking_code',
    description: 'The tracking code to view history',
    required: true,
  })
  trackingCode: string;
}

export class TrackEditDto {
  @StringOption({
    name: 'code',
    description: 'The tracking code to edit',
    required: true,
  })
  code: string;

  @StringOption({
    name: 'action',
    description: 'Action to perform: add, remove, add-channel, remark',
    required: true,
    choices: [
      { name: 'Add User (DM)', value: TrackEditAction.ADD },
      { name: 'Remove User', value: TrackEditAction.REMOVE },
      { name: 'Add Channel', value: TrackEditAction.ADD_CHANNEL },
      { name: 'Update Remark', value: TrackEditAction.REMARK },
    ],
  })
  action: TrackEditAction;

  @UserOption({
    name: 'user',
    description: 'User to add/remove from broadcast',
    required: false,
  })
  user?: any;

  @StringOption({
    name: 'value',
    description: 'New remark text (for remark action)',
    required: false,
  })
  value?: string;
}
