import {
  VerifyEmailUseCaseRequest,
  VerifyEmailUseCaseResponse,
} from './verify-email.use-case.interface';
import { left, right } from '../../../../shared/types/either';
import { UserIdentityProviderServiceAdapter } from '../../adapters/aws/aws-cognito-adapter';
import { UserNotFoundException } from '../../errors/user-not-found-exception';
import { UserRepository } from '../../repositories/UserRepository';

export class VerifyEmailUseCase {
  constructor(
    private userRepository: UserRepository,
    private identityProvider: UserIdentityProviderServiceAdapter,
  ) {}

  async execute({
    code,
    email,
    password,
  }: VerifyEmailUseCaseRequest): Promise<VerifyEmailUseCaseResponse> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      return left(new UserNotFoundException(email));
    }

    const id = user.getId();

    await this.identityProvider.confirmEmail(id, code);

    const token = await this.identityProvider.signIn(id, password);

    return right({
      statusCode: 200,
      token,
    });
  }
}
