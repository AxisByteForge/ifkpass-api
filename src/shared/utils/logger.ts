type LoggerEvent =
  | {
      body?: string | null;
      path?: string;
      httpMethod?: string;
    }
  | undefined;

type LoggerResponse = Record<string, unknown>;

type LoggerPayload = {
  request: {
    body: unknown;
    path: string | null;
    method: string | null;
  };
  response: LoggerResponse;
  error?: unknown;
};

const SENSITIVE_KEYS = new Set([
  'password',
  'newPassword',
  'oldPassword',
  'confirmPassword'
]);

const sanitizePayload = (payload: unknown): unknown => {
  if (payload === null || typeof payload !== 'object') {
    return payload;
  }

  if (Array.isArray(payload)) {
    return payload.map(sanitizePayload);
  }

  return Object.entries(payload).reduce<Record<string, unknown>>(
    (acc, [key, value]) => {
      if (SENSITIVE_KEYS.has(key)) {
        acc[key] = '[REDACTED]';
        return acc;
      }

      acc[key] = sanitizePayload(value);
      return acc;
    },
    {}
  );
};

const logger = (
  event: LoggerEvent,
  response: LoggerResponse,
  error?: unknown
): void => {
  let parsedBody: unknown;

  if (event?.body) {
    try {
      parsedBody = JSON.parse(event.body);
    } catch {
      parsedBody = event.body;
    }
  }

  const logObject: LoggerPayload = {
    request: {
      body: sanitizePayload(parsedBody),
      path: event?.path ?? null,
      method: event?.httpMethod ?? null
    },
    response
  };

  if (error instanceof Error) {
    logObject.error = {
      message: error.message,
      name: error.name,
      stack: error.stack
    };
  } else if (error !== undefined) {
    logObject.error = error;
  }

  console.log(JSON.stringify(logObject));
};

export { logger };
