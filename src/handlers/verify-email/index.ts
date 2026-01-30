import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { z } from 'zod';
import { verifyEmail as verifyEmailService } from '@/services/verify-email/verify-email.use-case';

const schema = z.object({
  Id: z.string(),
  emailVerificationCode: z.string()
});

export const verifyEmail = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const body = schema.parse(JSON.parse(event.body || '{}'));
    const result = await verifyEmailService({
      Id: body.Id,
      code: body.emailVerificationCode
    });

    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Validation Error',
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

    console.error('Error verifying email:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Erro interno ao verificar email' })
    };
  }
};
