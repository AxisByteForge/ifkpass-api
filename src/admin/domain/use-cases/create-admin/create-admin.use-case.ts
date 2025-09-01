import { left, right } from 'src/shared/types/either';
import { UserAlreadyExistsException } from 'src/user/domain/errors/user-already-exists-exception';

import {
  CreateAdminUseCaseRequest,
  CreateAdminUseCaseResponse,
} from './create-admin.use-case.interface';
import { AdminIdentityProviderServiceAdapter } from '../../adapters/aws-cognito-adapter';
import { Admin } from '../../entities/Admin.entity';
import { AdminRepository } from '../../repositories/AdminRepository';

export class CreateAdminUseCase {
  constructor(
    private adminRepository: AdminRepository,
    private identityProvider: AdminIdentityProviderServiceAdapter,
  ) {}

  async execute({
    props,
  }: CreateAdminUseCaseRequest): Promise<CreateAdminUseCaseResponse> {
    const admin = Admin.create({
      name: props.name,
      lastName: props.lastName,
      email: props.email,
    });

    const email = admin.getEmail();
    const id = admin.getId();

    const userAlreadyExists = await this.adminRepository.findByEmail(email);

    if (userAlreadyExists) {
      return left(new UserAlreadyExistsException(email));
    }

    await this.identityProvider.signUp(email, props.password, id);

    await Promise.all([
      this.adminRepository.create(admin),
      this.identityProvider.confirmEmailWithoutCode(id),
      this.identityProvider.promoteAdmin(id),
    ]);

    return right({
      message: 'Created',
    });
  }
}
