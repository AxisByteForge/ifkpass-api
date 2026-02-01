import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { verifyToken } from '@/shared/lib/jwt/jose/jose.jwt';
import { UnauthorizedError } from '@/shared/errors/http-errors';
import { RequestHeaders } from '@/shared/types/headers.type';
import { sendPhoto as sendPhotoService } from '@/services/send-photo/send-photo.service';

export const sendPhoto = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const headers = event.headers as Partial<RequestHeaders>;
    const { Id } = await verifyToken(headers.Authorization);

    const result = await sendPhotoService({ Id });

    return {
      statusCode: 201,
      body: JSON.stringify(result)
    };
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }

    console.error('Error sending photo:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Erro interno ao gerar URL de upload' })
    };
  }
};
