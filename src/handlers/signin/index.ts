import { signinUserService } from '@/services/signin/signin';
import { AppException, BadRequestException } from '@/shared/errors/http-errors';
import { TooManyTokensError } from '@/shared/errors/too-many-tokens-error';
import { logger } from '@/shared/utils/logger';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email()
});

export const signinUser = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const body = schema.parse(JSON.parse(event.body || '{}'));
    const result = await signinUserService({
      email: body.email
    });

    if (result instanceof TooManyTokensError) {
      return {
        statusCode: 429,
        body: JSON.stringify(result.toJSON())
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };
  } catch (error) {
    if (error instanceof AppException) {
      const response = {
        statusCode: error.statusCode,
        body: JSON.stringify({
          message: error.message,
          error: error.error
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
