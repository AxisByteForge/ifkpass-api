import { APIGatewayProxyEvent } from 'aws-lambda';

import {
  BadRequestException,
  UnauthorizedError,
} from 'src/shared/types/errors/http-errors';
import { verifyToken } from 'src/shared/lib/jwt/jose/jose.jwt';
import { RequestHeaders } from 'src/shared/types/header.type';

import { makePayCardUseCase } from './factory';
import { payCardValidate } from './validate';

async function payCard(event: APIGatewayProxyEvent) {
  const headers = event.headers as Partial<RequestHeaders>;

  let token: Awaited<ReturnType<typeof verifyToken>>;
  try {
    token = await verifyToken(headers.Authorization);
  } catch (err) {
    throw new UnauthorizedError(
      err instanceof Error ? err.message : 'Token inválido ou expirado',
    );
  }

  const body = JSON.parse(event.body || '{}');
  const parsed = payCardValidate.safeParse(body);

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

  const useCase = makePayCardUseCase();

  const result = await useCase.execute({
    userId: token.Id,
    action: parsed.data.action,
    paymentStatus: parsed.data.paymentStatus,
    paymentId: parsed.data.paymentId,
  });

  if (result.isLeft()) {
    throw new BadRequestException(result.value.message);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(result.value),
  };
}

export { payCard };
