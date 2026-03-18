import pino from 'pino';

const isDev = process.env['NODE_ENV'] !== 'production';

export const logger = pino(
  {
    level: isDev ? 'debug' : 'info',
    base: { service: 'ai-workspace' },
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level(label: string): Record<string, string> {
        return { level: label };
      },
    },
  },
  isDev
    ? pino.transport({
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      })
    : undefined,
);

export type Logger = typeof logger;
