import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context
} from 'aws-lambda';
import { logger } from '@/shared/lib/logger/logger';
import { approveUser } from './infra/handlers/approve-user';
import { authenticate } from './infra/handlers/authenticate';
import { createProfile } from './infra/handlers/create-profile';
import { createUser } from './infra/handlers/create-user';
import { forgotPassword } from './infra/handlers/forgot-password';
import { mercadoPagoWebhook } from './infra/handlers/webhook';
import { payCard } from './infra/handlers/pay-card';

import { resetPassword } from './infra/handlers/reset-password';
import { sendPhoto } from './infra/handlers/send-photo';

import { verifyEmail } from './infra/handlers/verify-email';

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  const routes: any = {
    POST: {
      '/user': createUser,
      '/user/verify-email': verifyEmail,
      '/user/profile': createProfile,
      '/user/profile/photo': sendPhoto,
      '/user/auth': authenticate,
      '/user/forgot-password': forgotPassword,
      '/user/reset-password': resetPassword,
      '/admin/approve-user': approveUser,
      '/user/pay-card': payCard,
      '/mercado-pago/webhook': mercadoPagoWebhook
      // Passwordless authentication routes
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
