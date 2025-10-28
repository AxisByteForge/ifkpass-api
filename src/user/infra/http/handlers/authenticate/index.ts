import { APIGatewayProxyEvent } from 'aws-lambda';

import {
  ConflictException,
  BadRequestException,
} from 'src/shared/types/errors/http-errors';

import { factory } from './factory';
import { authenticateValidate } from './validate';
import { EmailAlreadyVerifiedException } from '../../../../domain/errors/email-already-verified-exception';
import { UserAlreadyExistsException } from '../../../../domain/errors/user-already-exists-exception';
import { UserNotApprovedException } from '../../../../domain/errors/user-not-approved-exception';

async function authenticate(event: APIGatewayProxyEvent) {
  const body = JSON.parse(event.body || '{}');
  const parsed = authenticateValidate.safeParse(body);

  if (!parsed.success) {
    const { fieldErrors } = parsed.error.flatten();

    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Validation Error',
        errors: fieldErrors,
      }),
    };
  }

  const useCase = factory();

  const response = await useCase.execute({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (response.isLeft()) {
    const error = response.value;

    switch (error.constructor) {
      case UserAlreadyExistsException:
        throw new ConflictException(error.message);
      case EmailAlreadyVerifiedException:
        throw new BadRequestException(error.message);
      case UserNotApprovedException:
        return {
          statusCode: 403,
          body: JSON.stringify({
            message: error.message,
          }),
        };
      default:
        throw new BadRequestException(error.message);
    }
  }

  return {
    statusCode: 201,
    body: JSON.stringify(response.value),
  };
}

export { authenticate };
