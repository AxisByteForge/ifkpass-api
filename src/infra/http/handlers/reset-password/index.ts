import { APIGatewayProxyEvent } from 'aws-lambda';

import { BadRequestException } from '@/shared/types/errors/http-errors';

import { factory } from './factory';
import { resetPasswordValidate } from './validate';
import { UserNotFoundException } from '@/core/domain/errors/user-not-found-exception';

async function resetPassword(event: APIGatewayProxyEvent) {
  const body = JSON.parse(event.body || '{}');
  const parsed = resetPasswordValidate.safeParse(body);

  if (!parsed.success) {
    const { fieldErrors } = parsed.error.flatten();

    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Erro de validação',
        errors: fieldErrors
      })
    };
  }

  const useCase = factory();

  const response = await useCase.execute({
    email: parsed.data.email,
    code: parsed.data.code,
    newPassword: parsed.data.newPassword
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
    body: JSON.stringify(response.value)
  };
}

export { resetPassword };
