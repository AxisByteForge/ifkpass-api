import { APIGatewayProxyEvent } from 'aws-lambda';

import { verifyToken } from 'src/shared/lib/jwt/jose/jose.jwt';
import { UnauthorizedError } from 'src/shared/types/errors/http-errors';
import { RequestHeaders } from 'src/shared/types/header.type';

import { makeSendPhotoUseCase } from './factory';

async function sendPhoto(event: APIGatewayProxyEvent) {
  try {
    const headers = event.headers as Partial<RequestHeaders>;

    const { Id } = await verifyToken(headers.Authorization);

    const useCase = makeSendPhotoUseCase();

    const result = await useCase.execute({ Id });

    return {
      statusCode: 201,
      body: JSON.stringify(result.value),
    };
  } catch (err) {
    throw new UnauthorizedError(
      err instanceof Error ? err.message : 'Token inválido ou expirado',
    );
  }
}

export { sendPhoto };
