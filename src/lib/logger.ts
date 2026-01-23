/**
 * Simple logger utility with consistent prefixes
 * FR-1101: Logger utility
 *
 * Usage:
 *   import { createLogger } from '@/lib/logger';
 *   const log = createLogger('Auth');
 *   log.info('User logged in', { userId: '123' });
 *   // Output: [Auth] User logged in { userId: '123' }
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerOptions {
  /** Show timestamps in logs */
  timestamps?: boolean;
  /** Minimum log level (debug < info < warn < error) */
  minLevel?: LogLevel;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Production: only warn and error
// Development: all levels
const DEFAULT_MIN_LEVEL: LogLevel = process.env.NODE_ENV === 'production' ? 'warn' : 'debug';

function shouldLog(level: LogLevel, minLevel: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[minLevel];
}

function formatMessage(
  module: string,
  message: string,
  timestamps: boolean
): string {
  const prefix = timestamps
    ? `[${new Date().toISOString()}] [${module}]`
    : `[${module}]`;
  return `${prefix} ${message}`;
}

export interface Logger {
  debug: (message: string, data?: unknown) => void;
  info: (message: string, data?: unknown) => void;
  warn: (message: string, data?: unknown) => void;
  error: (message: string, data?: unknown) => void;
}

/**
 * Create a logger instance for a specific module
 *
 * @param module - Module name (e.g., 'Auth', 'Billing', 'Canvas')
 * @param options - Logger options
 * @returns Logger instance with debug, info, warn, error methods
 *
 * @example
 * const log = createLogger('Auth');
 * log.info('User signed up', { email: 'user@example.com' });
 *
 * @example
 * const log = createLogger('Billing', { timestamps: true });
 * log.warn('Payment failed', { reason: 'card_declined' });
 */
export function createLogger(module: string, options: LoggerOptions = {}): Logger {
  const { timestamps = false, minLevel = DEFAULT_MIN_LEVEL } = options;

  const log = (level: LogLevel, message: string, data?: unknown): void => {
    if (!shouldLog(level, minLevel)) return;

    const formattedMessage = formatMessage(module, message, timestamps);
    const consoleMethod = level === 'debug' ? 'log' : level;

    if (data !== undefined) {
      console[consoleMethod](formattedMessage, data);
    } else {
      console[consoleMethod](formattedMessage);
    }
  };

  return {
    debug: (message: string, data?: unknown) => log('debug', message, data),
    info: (message: string, data?: unknown) => log('info', message, data),
    warn: (message: string, data?: unknown) => log('warn', message, data),
    error: (message: string, data?: unknown) => log('error', message, data),
  };
}

// Pre-configured loggers for common modules
export const loggers = {
  auth: createLogger('Auth'),
  billing: createLogger('Billing'),
  canvas: createLogger('Canvas'),
  api: createLogger('API'),
  ai: createLogger('AI'),
  db: createLogger('DB'),
} as const;
