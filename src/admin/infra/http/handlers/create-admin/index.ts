import { APIGatewayProxyEvent } from 'aws-lambda';

import { AdminAlreadyExistsException } from 'src/admin/domain/errors/admin-already-exists-exception';
import {
  ConflictException,
  BadRequestException,
} from 'src/shared/types/errors/http-errors';

import { makeCreateAdminUseCase } from './factory';
import { createAdminValidate } from './validate';

async function createAdmin(event: APIGatewayProxyEvent) {
  const body = JSON.parse(event.body || '{}');
  const parsed = createAdminValidate.safeParse(body);

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

  const useCase = makeCreateAdminUseCase();

  const result = await useCase.execute({ props: parsed.data });

  if (result.isLeft()) {
    const error = result.value;

    switch (error.constructor) {
      case AdminAlreadyExistsException:
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
