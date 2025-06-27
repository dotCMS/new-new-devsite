/**
 * Debug utilities for Next.js application
 */

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

class DebugLogger {
  private logLevel: LogLevel;
  private isDebugMode: boolean;

  constructor() {
    this.logLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';
    this.isDebugMode = process.env.DEBUG === 'true';
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.isDebugMode && level === 'debug') return false;
    
    const levels: Record<LogLevel, number> = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };

    return levels[level] <= levels[this.logLevel];
  }

  private formatMessage(level: LogLevel, category: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${category}]`;
    
    if (data) {
      return `${prefix} ${message}\n${JSON.stringify(data, null, 2)}`;
    }
    
    return `${prefix} ${message}`;
  }

  error(category: string, message: string, data?: any) {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', category, message, data));
    }
  }

  warn(category: string, message: string, data?: any) {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', category, message, data));
    }
  }

  info(category: string, message: string, data?: any) {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', category, message, data));
    }
  }

  debug(category: string, message: string, data?: any) {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', category, message, data));
    }
  }

  // Specific debug methods for different parts of the app
  dotcms(message: string, data?: any) {
    if (process.env.DEBUG_DOTCMS === 'true') {
      this.debug('DOTCMS', message, data);
    }
  }

  cache(message: string, data?: any) {
    if (process.env.DEBUG_CACHE === 'true') {
      this.debug('CACHE', message, data);
    }
  }

  headers(message: string, data?: any) {
    if (process.env.DEBUG_HEADERS === 'true') {
      this.debug('HEADERS', message, data);
    }
  }

  routing(message: string, data?: any) {
    if (process.env.DEBUG_ROUTING === 'true') {
      this.debug('ROUTING', message, data);
    }
  }

  // Performance timing utility
  time(label: string) {
    if (this.isDebugMode) {
      console.time(`[DEBUG] ${label}`);
    }
  }

  timeEnd(label: string) {
    if (this.isDebugMode) {
      console.timeEnd(`[DEBUG] ${label}`);
    }
  }

  // Request debugging utility
  request(req: any, message?: string) {
    if (this.shouldLog('debug')) {
      const requestInfo = {
        method: req.method,
        url: req.url,
        headers: req.headers,
        query: req.query,
        body: req.body
      };
      
      this.debug('REQUEST', message || 'Incoming request', requestInfo);
    }
  }
}

// Export singleton instance
export const debugLogger = new DebugLogger();

// Export convenience functions
export const debug = debugLogger.debug.bind(debugLogger);
export const info = debugLogger.info.bind(debugLogger);
export const warn = debugLogger.warn.bind(debugLogger);
export const error = debugLogger.error.bind(debugLogger);
