/**
 * Environment-aware logger that only logs detailed information in development mode.
 * In production, sensitive details are suppressed to prevent information leakage.
 */

const isDev = import.meta.env.DEV;

interface LogData {
  [key: string]: unknown;
}

/**
 * Sanitizes error data by removing potentially sensitive information
 */
const sanitizeError = (error: unknown): string => {
  if (error instanceof Error) {
    // Only return the error message, not the full stack trace
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An error occurred';
};

/**
 * Logger utility that provides environment-aware logging.
 * - In development: Full error details are logged to console
 * - In production: Only generic messages are logged, sensitive data is suppressed
 */
export const logger = {
  /**
   * Log an error. In production, only logs a sanitized message.
   */
  error: (message: string, data?: unknown): void => {
    if (isDev) {
      console.error(message, data);
    }
    // In production, we suppress console output to prevent information leakage
    // A production app would send to a monitoring service here (e.g., Sentry, LogRocket)
  },

  /**
   * Log a warning. In production, warnings are suppressed.
   */
  warn: (message: string, data?: unknown): void => {
    if (isDev) {
      console.warn(message, data);
    }
  },

  /**
   * Log informational messages. In production, these are suppressed.
   */
  info: (message: string, data?: LogData): void => {
    if (isDev) {
      console.log(message, data);
    }
  },

  /**
   * Log debug information. Only available in development.
   */
  debug: (message: string, data?: unknown): void => {
    if (isDev) {
      console.debug(message, data);
    }
  },

  /**
   * Get a user-friendly error message from any error type.
   * Safe to display to users in production.
   */
  getUserMessage: (error: unknown, fallback = 'An unexpected error occurred'): string => {
    return sanitizeError(error) || fallback;
  },
};
