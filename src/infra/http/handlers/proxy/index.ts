import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';

import { logger } from '../../../../shared/lib/logger/logger';
import { authenticate } from '../authenticate';
import { createProfile } from '../create-profile';
import { createUser } from '../create-user';
import { forgotPassword } from '../forgot-password';
import { resetPassword } from '../reset-password';
import { sendPhoto } from '../send-photo';
import { verifyEmail } from '../verify-email';
import { approveUser } from '../approve-user';
import { payCard } from '../pay-card';
import { mercadoPagoWebhook } from '../mercado-pago/webhook';
import { AppException } from 'src/shared/types/errors/http-errors';

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
      '/user/forgot-password': forgotPassword,
      '/user/reset-password': resetPassword,
      '/admin/approve-user': approveUser,
      '/user/pay-card': payCard,
      '/mercado-pago/webhook': mercadoPagoWebhook,
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
      logger(event, response as any);
      return response;
    }

    return {
      statusCode: 404,
      body: JSON.stringify({ message: 'router not found' }),
    };
  } catch (error) {
    if (error instanceof AppException) {
      const response = {
        statusCode: error.statusCode,
        body: JSON.stringify({
          message: error.message,
          error: error.error,
        }),
      };
      logger(event, response, error);
      return response;
    }

    const response = {
      statusCode: 500,
      body: JSON.stringify({
        message:
          error instanceof Error ? error.message : 'internal server error',
      }),
    };
    logger(event, response, error);
    return response;
  }
};
