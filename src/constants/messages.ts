import { BaseMessageOptions, InteractionReplyOptions, MessagePayload } from 'discord.js';
import { formatString } from '../utils';

export default class SystemMessages {
  // Constants
  private static readonly SUCCESS = '✅';
  private static readonly ERROR = '❌';

  // Common
  public static readonly NOT_FOUND = 'Not found';
  public static readonly INVALID_ARGUMENTS = 'Invalid arguments';
  public static readonly INVALID_COMMAND = 'Invalid command';
  public static readonly INVALID_PERMISSIONS = 'Invalid permissions';
  public static readonly INVALID_USER = 'Invalid user';
  public static readonly INVALID_CHANNEL = 'Invalid channel';
  public static readonly ONLY_NSFW = 'This command is only available in NSFW channels';
  public static readonly ONLY_GUILD_TEXT = 'This command is only available in guilds text channels';

  // DiscordBot
  public static readonly OWNER_ONLY = 'Only the bot owner can use this command';
  public static readonly BOT_ERROR = 'An error occurred while executing this command';

  // BlueArchive
  public static readonly BA_NOTIFY_ADDED = 'Notify channel added';
  public static readonly BA_NOTIFY_REMOVED = 'Notify channel removed';
  public static readonly BA_NOTIFY_NOT_FOUND = 'Notify channel not found';
  public static readonly BA_RAID_NOT_FOUND = 'Raid not found';
  public static readonly BA_RAID_DIFFICULTY_UNAVAILABLE = 'Unavailable difficulty **{0}** in raid **{1}**';

  // NHentai
  public static readonly NHENTAI_AUTOVIEW_ON = 'NHentai Autoview **ON**';
  public static readonly NHENTAI_AUTOVIEW_OFF = 'NHentai Autoview **OFF**';

  /* Constructor */
  constructor(private message: string) {
    this.message = message;
  }

  // Methods
  private static get<T extends keyof typeof SystemMessages>(
    key: Extract<T, Uppercase<T>>,
    ...replacements: Array<string | number>
  ): string {
    if (replacements.length === 0) return SystemMessages[key];
    return formatString(SystemMessages[key], replacements);
  }
  public static error<T extends keyof typeof SystemMessages>(
    key: Extract<T, Uppercase<T>>,
    ...replacements: Array<string | number>
  ): SystemMessages {
    const message = `${this.ERROR} ${this.get(key, ...replacements)}`;
    return new this(message);
  }

  public static success<T extends keyof typeof SystemMessages>(
    key: Extract<T, Uppercase<T>>,
    ...replacements: Array<string | number>
  ): SystemMessages {
    const message = `${this.SUCCESS} ${this.get(key, ...replacements)}`;
    return new this(message);
  }

  public hint(hint: string): this {
    this.message = `${this.message}. Usage: ${hint}`;
    return this;
  }

  // Overriden methods
  public valueOf(): string {
    return this.message;
  }

  public toString(): string {
    return this.message;
  }
}
