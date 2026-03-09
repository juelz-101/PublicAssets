
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4, // Higher than any level, effectively disabling logs
}

export interface LogMessage {
  level: LogLevel;
  levelString: string;
  timestamp: Date;
  message: string;
  args: any[];
}

export type LogTransport = (log: LogMessage) => void;

export interface LoggerConfig {
  level?: LogLevel;
  transports?: LogTransport[];
}

export class Logger {
  private static instance: Logger;
  private config: Required<LoggerConfig>;

  private constructor(config: LoggerConfig = {}) {
    this.config = {
      level: LogLevel.INFO,
      transports: [this.consoleTransport()],
      ...config,
    };
  }

  public static getInstance(config?: LoggerConfig): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(config);
    }
    if (config) {
        Logger.instance.setConfig(config);
    }
    return Logger.instance;
  }

  public setConfig(config: LoggerConfig): void {
    this.config = { ...this.config, ...config };
  }
  
  public addTransport(transport: LogTransport): void {
      this.config.transports.push(transport);
  }
  
  public clearTransports(): void {
      this.config.transports = [];
  }
  
  private log(level: LogLevel, message: string, ...args: any[]): void {
    if (level < this.config.level) {
      return;
    }

    const logMessage: LogMessage = {
      level,
      levelString: LogLevel[level],
      timestamp: new Date(),
      message,
      args,
    };

    this.config.transports.forEach(transport => transport(logMessage));
  }
  
  public debug(message: string, ...args: any[]): void {
    this.log(LogLevel.DEBUG, message, ...args);
  }

  public info(message: string, ...args: any[]): void {
    this.log(LogLevel.INFO, message, ...args);
  }

  public warn(message: string, ...args: any[]): void {
    this.log(LogLevel.WARN, message, ...args);
  }

  public error(message: string, ...args: any[]): void {
    this.log(LogLevel.ERROR, message, ...args);
  }

  // --- Default Transports ---
  
  private formatMessage(log: LogMessage): string {
      const time = log.timestamp.toLocaleTimeString();
      return `[${time}] [${log.levelString}] ${log.message}`;
  }

  public consoleTransport(): LogTransport {
    return (log: LogMessage) => {
      const formattedMessage = this.formatMessage(log);
      const args = log.args.length > 0 ? log.args : [''];

      switch (log.level) {
        case LogLevel.DEBUG:
          console.debug(formattedMessage, ...args);
          break;
        case LogLevel.INFO:
          console.log(formattedMessage, ...args);
          break;
        case LogLevel.WARN:
          console.warn(formattedMessage, ...args);
          break;
        case LogLevel.ERROR:
          console.error(formattedMessage, ...args);
          break;
      }
    };
  }
}
