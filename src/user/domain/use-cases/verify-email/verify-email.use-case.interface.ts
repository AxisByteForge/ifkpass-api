import { Either } from 'src/shared/types/either';

import { EmailAlreadyVerifiedException } from '../../errors/email-already-verified-exception';
import { UserAlreadyExistsException } from '../../errors/user-already-exists-exception';

interface VerifyEmailUseCaseRequest {
  email: string;
  code: string;
  password: string;
}

type VerifyEmailUseCaseResponse = Either<
  UserAlreadyExistsException | EmailAlreadyVerifiedException,
  { statusCode: number; token: string }
>;

export { VerifyEmailUseCaseRequest, VerifyEmailUseCaseResponse };
