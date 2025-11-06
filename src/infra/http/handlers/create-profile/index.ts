import { APIGatewayProxyEvent } from 'aws-lambda';

import { verifyToken } from 'src/shared/lib/jwt/jose/jose.jwt';
import { UnauthorizedError } from 'src/shared/types/errors/http-errors';
import { RequestHeaders } from 'src/shared/types/header.type';

import { makeCreateProfileUseCase } from './factory';
import { profileValidate } from './validate';

async function createProfile(event: APIGatewayProxyEvent) {
  try {
    const body = JSON.parse(event.body || '{}');
    const parsed = profileValidate.safeParse(body);
    const headers = event.headers as Partial<RequestHeaders>;

    const { Id } = await verifyToken(headers.Authorization);

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

    const useCase = makeCreateProfileUseCase();

    const result = await useCase.execute({
      Id,
      body: parsed.data,
    });

    return {
      statusCode: 201,
      body: JSON.stringify(result),
    };
  } catch (err) {
    throw new UnauthorizedError(
      err instanceof Error ? err.message : 'Token inválido ou expirado',
    );
  }
}

export { createProfile };
