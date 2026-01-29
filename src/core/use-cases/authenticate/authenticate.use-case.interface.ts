import { Either } from 'src/shared/types/either';

import { UserAlreadyExistsException } from '../../domain/errors/user-already-exists-exception';

interface AuthenticateUseCaseRequest {
  email: string;
  password: string;
}

type AuthenticateUseCaseResponse = Either<
  UserAlreadyExistsException,
  { statusCode: number; token: string }
>;

export { AuthenticateUseCaseRequest, AuthenticateUseCaseResponse };
