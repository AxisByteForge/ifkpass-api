import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { z } from 'zod';
import { authenticate as authenticateService } from '@/services/authenticate/authenticate.service';

const schema = z.object({
  email: z.string().email(),
  code: z.string().length(6)
});

const authenticate = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const body = schema.parse(JSON.parse(event.body || '{}'));
    const result = await authenticateService(body);

    return result;
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

    if (error instanceof Error) {
      if (error.message.includes('não encontrado')) {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: error.message })
        };
      }
      if (
        error.message.includes('não foi aprovado') ||
        error.message.includes('rejeitada')
      ) {
        return {
          statusCode: 403,
          body: JSON.stringify({ message: error.message })
        };
      }
    }

    console.error('Error authenticating:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Erro interno ao autenticar' })
    };
  }
};

export { authenticate };
