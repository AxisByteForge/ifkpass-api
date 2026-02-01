import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { z } from 'zod';
import { createUser as createUserUseCase } from '@/services/create-user/create-user.service';
import { AppException, ConflictException } from '@/shared/errors/http-errors';

import { logger } from '@/shared/utils/logger';
import { UserAlreadyExistsError } from '@/shared/errors/user-already-exists-exception';

export const schema = z.object({
  name: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  password: z.string(),
  isAdmin: z.boolean().optional().default(false)
});

export const createUser = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const body = schema.parse(JSON.parse(event.body || '{}'));
    const result = await createUserUseCase(body);

    if (result instanceof UserAlreadyExistsError) {
      throw new ConflictException(result.message);
    }

    return {
      statusCode: 201,
      body: JSON.stringify({ userId: result })
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
