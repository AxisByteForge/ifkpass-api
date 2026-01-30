import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { z } from 'zod';
import { createUser as createUserUseCase } from '@/services/create-user/create-user.use-case';

export const schema = z.object({
  name: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  password: z.string(),
  isAdmin: z.boolean().optional().default(false)
});

export const createUser = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const body = schema.parse(JSON.parse(event.body || '{}'));
    const userId = await createUserUseCase(body);

    return {
      statusCode: 201,
      body: JSON.stringify({ userId })
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

    if (error instanceof Error && error.message.includes('já existe')) {
      return {
        statusCode: 409,
        body: JSON.stringify({ message: error.message })
      };
    }

    console.error('Error creating user:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Erro interno ao criar usuário' })
    };
  }
};
