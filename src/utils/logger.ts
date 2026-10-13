type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const getTimestamp = () => new Date().toISOString();

const formatLog = (level: LogLevel, message: string, meta?: unknown) => {
  const metaString = meta ? ` | Meta: ${JSON.stringify(meta)}` : '';
  return `[${getTimestamp()}] [${level.toUpperCase()}]: ${message}${metaString}`;
};

export const logger = {
  info: (message: string, meta?: unknown) => {
    console.log(`\x1b[32m${formatLog('info', message, meta)}\x1b[0m`);
  },
  warn: (message: string, meta?: unknown) => {
    console.warn(`\x1b[33m${formatLog('warn', message, meta)}\x1b[0m`);
  },
  error: (message: string, meta?: unknown) => {
    console.error(`\x1b[31m${formatLog('error', message, meta)}\x1b[0m`);
  },
  debug: (message: string, meta?: unknown) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`\x1b[36m${formatLog('debug', message, meta)}\x1b[0m`);
    }
  },
};
