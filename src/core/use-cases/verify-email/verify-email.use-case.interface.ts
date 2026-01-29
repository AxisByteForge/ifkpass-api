import { Either } from '@/shared/types/either';

import { EmailAlreadyVerifiedException } from '@/core/domain/errors/email-already-verified-exception';
import { UserAlreadyExistsException } from '@/core/domain/errors/user-already-exists-exception';

interface VerifyEmailUseCaseRequest {
  email: string;
  code: string;
}

type VerifyEmailUseCaseResponse = Either<
  UserAlreadyExistsException | EmailAlreadyVerifiedException,
  { message: string }
>;

export type { VerifyEmailUseCaseRequest, VerifyEmailUseCaseResponse };
