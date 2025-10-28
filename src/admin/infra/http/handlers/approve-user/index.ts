import { APIGatewayProxyEvent } from 'aws-lambda';

import { verifyToken } from 'src/shared/lib/jwt/jose/jose.jwt';
import { UnauthorizedError } from 'src/shared/types/errors/http-errors';
import { RequestHeaders } from 'src/shared/types/header.type';

import { makeApproveUserUseCase } from './factory';
import { approveUserValidate } from './validate';

async function approveUser(event: APIGatewayProxyEvent) {
  try {
    const body = JSON.parse(event.body || '{}');
    const parsed = approveUserValidate.safeParse(body);
    const headers = event.headers as Partial<RequestHeaders>;

    const { userId: adminId, isAdmin } = await verifyToken(
      headers.Authorization,
    );

    if (!isAdmin) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          message:
            'Acesso negado. Apenas administradores podem aprovar usuários.',
        }),
      };
    }

    if (!parsed.success) {
      const { fieldErrors } = parsed.error.flatten();

      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Erro de validação',
          errors: fieldErrors,
        }),
      };
    }

    const useCase = makeApproveUserUseCase();

    const result = await useCase.execute({
      adminId,
      userId: parsed.data.userId,
      status: parsed.data.status,
    });

    if (result.isLeft()) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: result.value.message,
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(result.value),
    };
  } catch (err) {
    throw new UnauthorizedError(
      err instanceof Error ? err.message : 'Token inválido ou expirado',
    );
  }
}

export { approveUser };
