import { APIGatewayProxyEvent } from 'aws-lambda';

import { makeRegisterUseCase } from './factory';
import { registerValidate } from './validate';
import {
  BadRequestException,
  ConflictException,
} from '../../../../../core/domain/errors/http-errors';
import { UserAlreadyExistsException } from '../../../../../core/domain/errors/user-already-exists-exception';

async function createAdmin(event: APIGatewayProxyEvent) {
  const body = JSON.parse(event.body || '{}');
  const parsed = registerValidate.safeParse(body);

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

  const useCase = makeRegisterUseCase();

  const result = await useCase.execute({ props: parsed.data });

  if (result.isLeft()) {
    const error = result.value;

    switch (error.constructor) {
      case UserAlreadyExistsException:
        throw new ConflictException(error.message);
      default:
        throw new BadRequestException(error.message);
    }
  }

  return {
    statusCode: 201,
    body: JSON.stringify(result),
  };
}

export { createAdmin };
