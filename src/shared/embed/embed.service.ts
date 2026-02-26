import { Injectable } from '@nestjs/common';
import { EmbedBuilder, ColorResolvable } from 'discord.js';

export const EMBED_LIMITS = {
  TITLE: 256,
  DESCRIPTION: 4096,
  FIELD_NAME: 256,
  FIELD_VALUE: 1024,
  FIELDS: 25,
  FOOTER_TEXT: 2048,
  AUTHOR_NAME: 256,
  TOTAL: 6000,
  IMAGES: 4,
  PER_MESSAGE: 10,
} as const;

export const DEFAULT_EMBED_COLOR = 0x0099ff;

@Injectable()
export class EmbedService {
  create(options?: {
    color?: ColorResolvable;
    title?: string;
    description?: string;
  }): EmbedBuilder {
    const embed = new EmbedBuilder().setColor(
      options?.color ?? DEFAULT_EMBED_COLOR,
    );
    if (options?.title)
      embed.setTitle(this.truncate(options.title, EMBED_LIMITS.TITLE));
    if (options?.description)
      embed.setDescription(
        this.truncate(options.description, EMBED_LIMITS.DESCRIPTION),
      );
    return embed;
  }

  error(message: string, title = '❌ Error'): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle(title)
      .setDescription(this.truncate(message, EMBED_LIMITS.DESCRIPTION))
      .setColor(0xff0000)
      .setTimestamp();
  }

  success(message: string, title = '✅ Success'): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle(title)
      .setDescription(this.truncate(message, EMBED_LIMITS.DESCRIPTION))
      .setColor(0x00ff00)
      .setTimestamp();
  }

  info(message: string, title = 'ℹ️ Info'): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle(title)
      .setDescription(this.truncate(message, EMBED_LIMITS.DESCRIPTION))
      .setColor(0x0099ff)
      .setTimestamp();
  }

  truncate(text: string, maxLength: number): string {
    return text.length > maxLength
      ? text.substring(0, maxLength - 3) + '...'
      : text;
  }

  safeFieldValue(value: string | null | undefined, fallback = 'N/A'): string {
    if (!value || value.trim() === '') return fallback;
    return this.truncate(value, EMBED_LIMITS.FIELD_VALUE);
  }
}
