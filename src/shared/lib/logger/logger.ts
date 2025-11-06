import pino from 'pino';

type LoggerEvent = { body?: string | null } | undefined;

const sanitizeSensitiveFields = (payload: unknown): unknown => {
  if (payload === null || typeof payload !== 'object') {
    return payload;
  }

  if (Array.isArray(payload)) {
    return payload.map(sanitizeSensitiveFields);
  }

  const sensitiveKeys = new Set([
    'password',
    'newPassword',
    'oldPassword',
    'confirmPassword',
  ]);

  return Object.entries(payload).reduce<Record<string, unknown>>(
    (acc, [key, value]) => {
      if (sensitiveKeys.has(key)) {
        acc[key] = '[REDACTED]';
        return acc;
      }

      acc[key] = sanitizeSensitiveFields(value);
      return acc;
    },
    {},
  );
};

const logger = (
  event: LoggerEvent,
  response: Record<string, unknown>,
  error?: unknown,
): void => {
  let parsedBody: unknown = undefined;
  try {
    parsedBody = event?.body ? JSON.parse(event.body) : undefined;
  } catch {
    parsedBody = event?.body;
  }

  const logObject: {
    request: { body: unknown };
    response: Record<string, unknown>;
    error?: unknown;
  } = {
    request: {
      body: sanitizeSensitiveFields(parsedBody),
    },
    response,
  };

  const loggerInstance = pino({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport:
      process.env.NODE_ENV !== 'production'
        ? {
            target: 'pino-pretty',
            options: { colorize: true, translateTime: 'SYS:standard' },
          }
        : undefined,
  });

  if (error instanceof Error) {
    logObject.error = {
      message: error.message,
      name: error.name,
      stack: error.stack,
    };
    loggerInstance.error(logObject, 'Request failed');
  } else if (error !== undefined) {
    logObject.error = error;
    loggerInstance.error(logObject, 'Request failed (non-error)');
  } else {
    loggerInstance.info(logObject, 'Request handled successfully');
  }
};

export { logger };
