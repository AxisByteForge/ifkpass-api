import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { z } from 'zod';

import { UnauthorizedError } from '@/shared/errors/http-errors';
import { RequestHeaders } from '@/shared/types/headers.type';
import { createProfile as createProfileService } from '@/services/create-profile/create-profile.service';
import { verifyToken } from '@/infra/jwt/jwt.service';

const schema = z.object({
  birthDate: z.string(),
  city: z.string(),
  cpf: z.string(),
  dojo: z.string(),
  rank: z.string(),
  sensei: z.string()
});

export const createProfile = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const headers = event.headers as Partial<RequestHeaders>;
    const { id } = await verifyToken(headers.Authorization ?? '');

    const body = schema.parse(JSON.parse(event.body || '{}'));
    const result = await createProfileService({ id, body });

    return {
      statusCode: 201,
      body: JSON.stringify(result)
    };
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }

    if (error instanceof z.ZodError) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Validation error',
          errors: error.flatten().fieldErrors
        })
      };
    }

    if (error instanceof Error && error.message.includes('não encontrado')) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: error.message })
      };
    }

    console.error('Error creating profile:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Erro interno ao criar perfil' })
    };
  }
};
