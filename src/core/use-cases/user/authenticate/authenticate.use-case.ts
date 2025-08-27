import {
  AuthenticateUseCaseRequest,
  AuthenticateUseCaseResponse,
} from './authenticate.use-case.interface';
import { IdentityProviderServiceAdapter } from '../../../domain/adapters/aws/aws-cognito-adapter';
import { left, right } from '../../../domain/either';
import { UserNotFoundException } from '../../../domain/errors/user-not-found-exception';
import { UserRepository } from '../../../domain/repositories/UserRepository';

export class AuthenticateUseCase {
  constructor(
    private userRepository: UserRepository,
    private identityProvider: IdentityProviderServiceAdapter,
  ) {}

  async execute({
    email,
    password,
  }: AuthenticateUseCaseRequest): Promise<AuthenticateUseCaseResponse> {
    const userAlreadyExists = await this.userRepository.findByEmail(email);

    if (!userAlreadyExists) {
      return left(new UserNotFoundException(email));
    }

    const token = await this.identityProvider.signIn(email, password);

    return right({
      statusCode: 200,
      token,
    });
  }
}
