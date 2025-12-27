/**
 * Application Logger
 * Structured logging with levels and metadata
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: Record<string, unknown>;
  error?: Error;
}

interface LoggerConfig {
  minLevel: LogLevel;
  enabled: boolean;
  includeTimestamp: boolean;
  persistToStorage: boolean;
  maxStoredLogs: number;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private config: LoggerConfig;
  private logs: LogEntry[] = [];
  private storageKey = 'solstack_logs';

  constructor(config?: Partial<LoggerConfig>) {
    this.config = {
      minLevel: 'info',
      enabled: true,
      includeTimestamp: true,
      persistToStorage: false,
      maxStoredLogs: 100,
      ...config,
    };

    // Load persisted logs
    if (this.config.persistToStorage) {
      this.loadFromStorage();
    }
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false;
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.minLevel];
  }

  private formatMessage(level: LogLevel, message: string): string {
    const prefix = `[${level.toUpperCase()}]`;
    const timestamp = this.config.includeTimestamp 
      ? `[${new Date().toISOString()}]` 
      : '';
    return `${timestamp} ${prefix} ${message}`;
  }

  private createEntry(
    level: LogLevel, 
    message: string, 
    data?: Record<string, unknown>,
    error?: Error
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
      error,
    };
  }

  private persistLog(entry: LogEntry): void {
    this.logs.push(entry);
    
    // Trim old logs
    if (this.logs.length > this.config.maxStoredLogs) {
      this.logs = this.logs.slice(-this.config.maxStoredLogs);
    }

    // Save to storage
    if (this.config.persistToStorage && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.logs));
      } catch {
        // Storage full, clear old logs
        this.logs = this.logs.slice(-50);
      }
    }
  }

  private loadFromStorage(): void {
    if (typeof localStorage === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch {
      this.logs = [];
    }
  }

  debug(message: string, data?: Record<string, unknown>): void {
    if (!this.shouldLog('debug')) return;
    const entry = this.createEntry('debug', message, data);
    this.persistLog(entry);
    console.debug(this.formatMessage('debug', message), data || '');
  }

  info(message: string, data?: Record<string, unknown>): void {
    if (!this.shouldLog('info')) return;
    const entry = this.createEntry('info', message, data);
    this.persistLog(entry);
    console.info(this.formatMessage('info', message), data || '');
  }

  warn(message: string, data?: Record<string, unknown>): void {
    if (!this.shouldLog('warn')) return;
    const entry = this.createEntry('warn', message, data);
    this.persistLog(entry);
    console.warn(this.formatMessage('warn', message), data || '');
  }

  error(message: string, error?: Error | unknown, data?: Record<string, unknown>): void {
    if (!this.shouldLog('error')) return;
    const err = error instanceof Error ? error : undefined;
    const entry = this.createEntry('error', message, data, err);
    this.persistLog(entry);
    console.error(this.formatMessage('error', message), { error, ...data });
  }

  /**
   * Log a transaction
   */
  transaction(
    type: string, 
    status: 'pending' | 'success' | 'failed',
    details: Record<string, unknown>
  ): void {
    const level = status === 'failed' ? 'error' : 'info';
    this[level](`Transaction ${type}: ${status}`, { type, status, ...details });
  }

  /**
   * Log an API call
   */
  api(
    method: string,
    endpoint: string,
    status: number,
    duration: number,
    error?: string
  ): void {
    const level = status >= 400 ? 'error' : 'debug';
    this[level](`API ${method} ${endpoint}`, { 
      method, 
      endpoint, 
      status, 
      duration: `${duration}ms`,
      error 
    });
  }

  /**
   * Log wallet activity
   */
  wallet(action: string, details: Record<string, unknown>): void {
    this.info(`Wallet ${action}`, details);
  }

  /**
   * Get all stored logs
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Get logs by level
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.storageKey);
    }
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Set log level
   */
  setLevel(level: LogLevel): void {
    this.config.minLevel = level;
  }

  /**
   * Enable/disable logging
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }
}

// Create and export default logger
export const logger = new Logger({
  minLevel: import.meta.env.DEV ? 'debug' : 'info',
  persistToStorage: true,
  maxStoredLogs: 200,
});

export { Logger, type LogLevel, type LogEntry };
