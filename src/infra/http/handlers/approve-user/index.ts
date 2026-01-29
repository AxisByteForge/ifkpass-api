import { APIGatewayProxyEvent } from 'aws-lambda';

import {
  BadRequestException,
  ForbiddenException,
  UnauthorizedError,
} from 'src/shared/types/errors/http-errors';
import { verifyToken } from 'src/shared/lib/jwt/jose/jose.jwt';
import { RequestHeaders } from 'src/shared/types/header.type';
import { UserStatus } from 'src/core/domain/entities/User.entity';

import { makeApproveUserUseCase } from './factory';
import { approveUserValidate } from './validate';

async function approveUser(event: APIGatewayProxyEvent) {
  const headers = event.headers as Partial<RequestHeaders>;

  let token: Awaited<ReturnType<typeof verifyToken>>;
  try {
    token = await verifyToken(headers.Authorization);
  } catch (err) {
    throw new UnauthorizedError(
      err instanceof Error ? err.message : 'Token inválido ou expirado',
    );
  }

  const { Id: adminId, isAdmin } = token;

  if (!isAdmin) {
    throw new ForbiddenException(
      'Administrador necessário para aprovar usuários',
    );
  }

  const body = JSON.parse(event.body || '{}');
  const parsed = approveUserValidate.safeParse(body);

  if (!parsed.success) {
    const { fieldErrors } = parsed.error.flatten();

    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Validation error',
        errors: fieldErrors,
      }),
    };
  }

  const useCase = makeApproveUserUseCase();

  const result = await useCase.execute({
    adminId,
    Id: parsed.data.Id,
    status:
      parsed.data.status === 'approved'
        ? UserStatus.APPROVED
        : UserStatus.REJECTED,
  });

  if (result.isLeft()) {
    throw new BadRequestException(result.value.message);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(result.value),
  };
}

export { approveUser };
