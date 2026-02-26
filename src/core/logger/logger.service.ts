import { Injectable, ConsoleLogger, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as fs from 'fs';
import * as path from 'path';
import { inspect } from 'util';

@Injectable({ scope: Scope.TRANSIENT })
export class AppLoggerService extends ConsoleLogger {
  private isDevelopment: boolean;
  private logFilePath: string;
  private static isFileCleared = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super();
    this.isDevelopment =
      this.configService.get<string>('BOT_ENV') === 'development';
    this.logFilePath = path.join(process.cwd(), 'debug.log');

    // Clear the log file only once per run
    if (this.isDevelopment && !AppLoggerService.isFileCleared) {
      fs.writeFileSync(this.logFilePath, '');
      AppLoggerService.isFileCleared = true;
    }
  }

  private writeToFile(message: string, context?: string, levelStr?: string) {
    if (!this.isDevelopment) return;

    try {
      const timestamp = new Date().toISOString();
      const ctxStr = context ? ` [${context}]` : '';
      const levelPad = (levelStr || 'LOG').padEnd(7, ' ');
      const logLine = `${timestamp} - ${levelPad}${ctxStr} ${message}\n`;
      fs.appendFileSync(this.logFilePath, logLine);
    } catch (e) {
      console.error('Failed to write to debug.log', e);
    }
  }

  log(message: any, context?: string) {
    super.log(message, context);
    const textMsg =
      typeof message === 'object'
        ? inspect(message, { colors: false, depth: null })
        : String(message);
    this.writeToFile(textMsg, context || this.context, 'LOG');
  }

  error(message: any, stackOrContext?: string, context?: string) {
    super.error(message, stackOrContext, context);

    let resolvedContext = context || this.context || '';
    let finalMessage =
      typeof message === 'object'
        ? inspect(message, { colors: false, depth: null })
        : String(message);

    // Still maintain stack override logic just in case NestJS passes string message but stack trace
    if (
      message instanceof Error &&
      message.stack &&
      !finalMessage.includes(message.stack)
    ) {
      finalMessage += `\n${message.stack}`;
    }

    if (stackOrContext && !context && message instanceof Error) {
      resolvedContext = stackOrContext;
    } else if (stackOrContext) {
      // Determine if stackOrContext is an actual stack trace vs just a context string
      const isStack =
        stackOrContext.includes('\n') ||
        stackOrContext.startsWith('Error:') ||
        stackOrContext.startsWith('AxiosError:') ||
        stackOrContext.includes('Trace');

      if (!context && !isStack) {
        // It's just the context
        resolvedContext = stackOrContext;
      } else if (isStack) {
        // It's genuinely a stack trace
        finalMessage += `\n${stackOrContext}`;
      }
    }

    this.writeToFile(finalMessage, resolvedContext, 'ERROR');

    // Broadcast error to asynchronous internal listeners
    this.eventEmitter.emit('log.error', {
      message: finalMessage,
      context: resolvedContext,
      stack: stackOrContext,
    });
  }

  warn(message: any, context?: string) {
    super.warn(message, context);
    this.writeToFile(String(message), context || this.context, 'WARN');
  }

  debug(message: any, context?: string) {
    super.debug(message, context);
    this.writeToFile(String(message), context || this.context, 'DEBUG');
  }

  verbose(message: any, context?: string) {
    super.verbose(message, context);
    this.writeToFile(String(message), context || this.context, 'VERBOSE');
  }
}
