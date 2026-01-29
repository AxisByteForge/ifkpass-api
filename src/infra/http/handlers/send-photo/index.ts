import { APIGatewayProxyEvent } from 'aws-lambda';

import { verifyToken } from '@/shared/lib/jwt/jose/jose.jwt';
import { UnauthorizedError } from '@/shared/types/errors/http-errors';
import { RequestHeaders } from '@/shared/types/headers.type';

import { makeSendPhotoUseCase } from './factory';

async function sendPhoto(event: APIGatewayProxyEvent) {
  try {
    const headers = event.headers as Partial<RequestHeaders>;

    const { Id } = await verifyToken(headers.Authorization);

    const useCase = makeSendPhotoUseCase();

    const result = await useCase.execute({ Id });

    return {
      statusCode: 201,
      body: JSON.stringify(result.value)
    };
  } catch (err) {
    throw new UnauthorizedError(
      err instanceof Error ? err.message : 'Token inválido ou expirado'
    );
  }
}

export { sendPhoto };
