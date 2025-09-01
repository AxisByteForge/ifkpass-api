import pino from 'pino';

const logger = (
  event: any,
  response: Record<string, any>,
  error?: unknown,
): void => {
  const body = JSON.parse(event.body || '{}');

  if ('password' in body) {
    body.password = '[REDACTED]';
  }

  const logObject: {
    request: { body: any };
    response: Record<string, any>;
    error?: unknown;
  } = {
    request: {
      body: event.body,
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
