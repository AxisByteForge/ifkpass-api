import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';

import { logger } from '../../../../shared/common/logger/logger';
import { authenticate } from '../functions/authenticate';
import { createProfile } from '../functions/create-profile';
import { createUser } from '../functions/create-user';
import { sendPhoto } from '../functions/send-photo';
import { verifyEmail } from '../functions/verify-email';

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
