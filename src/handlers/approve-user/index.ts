import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { z } from 'zod';
import { verifyToken } from '@/shared/lib/jwt/jose/jose.jwt';
import {
  UnauthorizedError,
  ForbiddenException
} from '@/shared/errors/http-errors';
import { RequestHeaders } from '@/shared/types/headers.type';
import { approveUser as approveUserService } from '@/services/approve-user/approve-user.use-case';

const schema = z.object({
  Id: z.string(),
  status: z.enum(['approved', 'rejected'])
});

export const approveUser = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const headers = event.headers as Partial<RequestHeaders>;
    const token = await verifyToken(headers.Authorization);

    if (!token.isAdmin) {
      throw new ForbiddenException(
        'Administrador necessário para aprovar usuários'
      );
    }

    const body = schema.parse(JSON.parse(event.body || '{}'));
    const result = await approveUserService({
      adminId: token.Id,
      Id: body.Id,
      status: body.status
    });

    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };
  } catch (error) {
    if (
      error instanceof UnauthorizedError ||
      error instanceof ForbiddenException
    ) {
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

    console.error('Error approving user:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Erro interno ao aprovar usuário' })
    };
  }
};
