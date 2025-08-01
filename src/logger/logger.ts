import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { v4 as uuidv4 } from 'uuid';
import { debugInConsole } from '../constants/env.constants';

// CommonJS: dùng __filename và __dirname có sẵn
// const __filename = __filename;
// const __dirname = __dirname;

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LoggerOptions {
  logToConsole?: boolean;
  logLevel?: LogLevel;
}

class Logger {
  private static instance: Logger;
  private logFilePath: string;
  private logToConsole: boolean;
  private logLevel: LogLevel;
  private sessionId: string;

  private constructor(options: LoggerOptions = { logToConsole: true, logLevel: 'info' }) {
    const logDir = path.resolve(process.cwd(), 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    this.sessionId = uuidv4();

    this.logFilePath = path.join(logDir, `${this.sessionId}.log`);
    this.logToConsole = options.logToConsole ?? true;
    this.logLevel = options.logLevel ?? 'info';
  }

  private writeLog(level: LogLevel, message: string, additionalInfo?: any): void {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} - ${level.toUpperCase()}: ${message}`;
    const fullLogMessage = additionalInfo
      ? `${logMessage} - ${JSON.stringify(additionalInfo)}`
      : logMessage;

    fs.appendFileSync(this.logFilePath, fullLogMessage + '\n');

    if (this.logToConsole && this.shouldLog(level)) {
      const formattedMessage = this.getColoredMessage(level, timestamp, message, additionalInfo);
      console.log(formattedMessage.trim());
    }
  }

  private getColoredMessage(
    level: LogLevel,
    timestamp: string,
    message: string,
    additionalInfo?: any,
  ): string {
    const logLevels = {
      info: chalk.bgGreen.black,
      warn: chalk.bgYellow.black,
      error: chalk.bgRed.white,
      debug: chalk.bgBlue.white,
    };

    const levelLabel = logLevels[level](` ${level.toUpperCase()} `);
    const timestampLabel = chalk.dim(`[${timestamp}]`);
    const msgLabel = chalk.bold(message);
    const additionalLabel = additionalInfo
      ? chalk.gray(` - ${JSON.stringify(additionalInfo)}`)
      : '';

    return `${levelLabel} ${timestampLabel} ${msgLabel}${additionalLabel}`;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.logLevel);
  }

  public static init(options?: LoggerOptions) {
    if (!Logger.instance) {
      Logger.instance = new Logger(options);
      (global as any).logger = {
        info: Logger.info.bind(Logger),
        warn: Logger.warn.bind(Logger),
        error: Logger.error.bind(Logger),
        debug: Logger.debug.bind(Logger),
      };
    }
  }

  public static info(message: string, additionalInfo?: any): void {
    Logger.instance.writeLog('info', message, additionalInfo);
  }

  public static warn(message: string, additionalInfo?: any): void {
    Logger.instance.writeLog('warn', message, additionalInfo);
  }

  public static error(message: string, additionalInfo?: any): void {
    Logger.instance.writeLog('error', message, additionalInfo);
  }

  public static debug(message: string, additionalInfo?: any): void {
    Logger.instance.writeLog('debug', message, additionalInfo);
  }

  public static getSessionId(): string {
    return Logger.instance.sessionId;
  }
}

// Initialize the logger
Logger.init({
  logToConsole: debugInConsole === 'true',
  logLevel: 'debug',
});

export const logger = {
  info: Logger.info,
  warn: Logger.warn,
  error: Logger.error,
  debug: Logger.debug,
  getSessionId: Logger.getSessionId,
};
