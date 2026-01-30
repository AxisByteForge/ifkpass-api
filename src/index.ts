import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context
} from 'aws-lambda';
import { logger } from '@/shared/utils/logger';
import { approveUser } from './handlers/approve-user';
import { authenticate } from './handlers/authenticate';
import { createProfile } from './handlers/create-profile';
import { createUser } from './handlers/create-user';

import { mercadoPagoWebhook } from './handlers/webhook';
import { payCard } from './handlers/pay-card';

import { sendPhoto } from './handlers/send-photo';

import { verifyEmail } from './handlers/verify-email';

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  const routes: any = {
    POST: {
      '/api/v1/admins/approve': approveUser,
      '/api/v1/users/signup': createUser,
      '/api/v1/users/signin': verifyEmail,
      '/api/v1/users/profile': createProfile,
      '/api/v1/users/profile/photo': sendPhoto,
      '/api/v1/users/auth': authenticate,
      '/api/v1/users/pay-card': payCard,
      '/api/v1/mercado-pago/webhook': mercadoPagoWebhook
    }
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
              body: JSON.stringify({ message: 'timeout' })
            });
          },
          Math.max(0, context.getRemainingTimeInMillis() - 2000)
        );
      });

      const response = await Promise.race([task, timeout]);
      logger(event, response as any);
      return response;
    }

    return {
      statusCode: 404,
      body: JSON.stringify({ message: 'router not found' })
    };
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      const response = {
        statusCode: (error as any).statusCode,
        body: JSON.stringify({
          message: error.message,
          error: (error as any).error
        })
      };
      logger(event, response, error);
      return response;
    }

    const response = {
      statusCode: 500,
      body: JSON.stringify({
        message:
          error instanceof Error ? error.message : 'internal server error'
      })
    };
    logger(event, response, error);
    return response;
  }
};
