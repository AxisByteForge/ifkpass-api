import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { z } from 'zod';
import { forgotPassword as forgotPasswordService } from '@/services/forgot-password/forgot-password.use-case';

const schema = z.object({
  email: z.string().email()
});

export const forgotPassword = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const body = schema.parse(JSON.parse(event.body || '{}'));
    const result = await forgotPasswordService(body);

    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Erro de validação',
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

    console.error('Error in forgot password:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Erro interno ao solicitar redefinição de senha'
      })
    };
  }
};
