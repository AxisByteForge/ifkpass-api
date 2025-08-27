import {
  VerifyEmailUseCaseRequest,
  VerifyEmailUseCaseResponse,
} from './verify-email.use-case.interface';
import { IdentityProviderServiceAdapter } from '../../../domain/adapters/aws/aws-cognito-adapter';
import { left, right } from '../../../domain/either';
import { Email } from '../../../domain/entities/User.entity';
import { EmailAlreadyVerifiedException } from '../../../domain/errors/email-already-verified-exception';
import { UserNotFoundException } from '../../../domain/errors/user-not-found-exception';
import { UserRepository } from '../../../domain/repositories/UserRepository';

export class VerifyEmailUseCase {
  constructor(
    private userRepository: UserRepository,
    private identityProvider: IdentityProviderServiceAdapter,
  ) {}

  async execute({
    code,
    email: rawEmail,
    password,
  }: VerifyEmailUseCaseRequest): Promise<VerifyEmailUseCaseResponse> {
    const email = new Email(rawEmail);

    const userAlreadyExists = await this.userRepository.findByEmail(
      email.getValue(),
    );

    if (!userAlreadyExists) {
      return left(new UserNotFoundException(email.getValue()));
    }

    const isEmailVerified = await this.identityProvider.isEmailVerified(
      email.getValue(),
    );

    if (isEmailVerified) {
      return left(new EmailAlreadyVerifiedException(email.getValue()));
    }

    await this.identityProvider.confirmEmail(email.getValue(), code);

    const token = await this.identityProvider.signIn(
      email.getValue(),
      password,
    );

    return right({
      statusCode: 200,
      token,
    });
  }
}
