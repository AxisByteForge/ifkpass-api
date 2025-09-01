import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';

import { createAdmin } from 'src/admin/infra/http/handlers/create-admin';
import { sendPhoto } from 'src/user/infra/http/handlers/send-photo';

import { logger } from '../shared/lib/logger/logger';
import { authenticate } from '../user/infra/http/handlers/authenticate';
import { createProfile } from '../user/infra/http/handlers/create-profile';
import { createUser } from '../user/infra/http/handlers/create-user';
import { verifyEmail } from '../user/infra/http/handlers/verify-email';

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  const routes: Record<
    string,
    Record<string, (e: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>>
  > = {
    POST: {
      '/user': createUser,
      '/admin': createAdmin,
      '/user/verify-email': verifyEmail,
      '/user/profile': createProfile,
      '/user/profile/photo': sendPhoto,
      '/user/auth': authenticate,
    },
  };

  try {
    const handlerFn = routes[event.httpMethod]?.[event.path];

    if (handlerFn) {
      const task = handlerFn(event);

      const timeout = new Promise<APIGatewayProxyResult>((resolve) => {
        setTimeout(
          () => {
            resolve({
              statusCode: 408,
              body: JSON.stringify({ message: 'timeout' }),
            });
          },
          Math.max(0, context.getRemainingTimeInMillis() - 2000),
        );
      });

      const response = await Promise.race([task, timeout]);
      logger(event, response);
      return response;
    }

    return {
      statusCode: 404,
      body: JSON.stringify({ message: 'router not found' }),
    };
  } catch (error) {
    logger(event, { statusCode: 500 }, error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message:
          error instanceof Error ? error.message : 'internal server error',
      }),
    };
  }
};
