import { TrackEditCommands } from './track-edit.commands';
import { TrackCommands } from './track.commands';
import { UntrackCommands } from './untrack.commands';

export { TrackCommands, TrackEditCommands, UntrackCommands };

export const DeliveryTrackerCommandProviders = [
  TrackCommands,
  TrackEditCommands,
  UntrackCommands,
];
