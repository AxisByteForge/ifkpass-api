import { APIGatewayProxyEvent } from 'aws-lambda';

import { BadRequestException } from 'src/shared/types/errors/http-errors';

import { factory } from './factory';
import { forgotPasswordValidate } from './validate';
import { UserNotFoundException } from '../../../../domain/errors/user-not-found-exception';

async function forgotPassword(event: APIGatewayProxyEvent) {
  const body = JSON.parse(event.body || '{}');
  const parsed = forgotPasswordValidate.safeParse(body);

  if (!parsed.success) {
    const { fieldErrors } = parsed.error.flatten();

    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Erro de validação',
        errors: fieldErrors,
      }),
    };
  }

  const useCase = factory();

  const response = await useCase.execute({
    email: parsed.data.email,
  });

  if (response.isLeft()) {
    const error = response.value;

    switch (error.constructor) {
      case UserNotFoundException:
        throw new BadRequestException(error.message);
      default:
        throw new BadRequestException(error.message);
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify(response.value),
  };
}

export { forgotPassword };
