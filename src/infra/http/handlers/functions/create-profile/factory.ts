import { CreateProfileUseCase } from '../../../../../core/use-cases/user/create-profile/create-profile.use-case';
import { DynamoUserRepository } from '../../../../database/dynamo/users-repository.dynamo';

export function makeCreateProfileUseCase() {
  const usersRepository = new DynamoUserRepository();
  const createProfileUseCase = new CreateProfileUseCase(usersRepository);
  return createProfileUseCase;
}
