import { Either } from 'src/shared/types/either';

import { EmailAlreadyVerifiedException } from '../../domain/errors/email-already-verified-exception';
import { UserAlreadyExistsException } from '../../domain/errors/user-already-exists-exception';

interface VerifyEmailUseCaseRequest {
  email: string;
  code: string;
}

type VerifyEmailUseCaseResponse = Either<
  UserAlreadyExistsException | EmailAlreadyVerifiedException,
  { message: string }
>;

export { VerifyEmailUseCaseRequest, VerifyEmailUseCaseResponse };
