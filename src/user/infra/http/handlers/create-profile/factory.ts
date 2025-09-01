import { DynamoModule } from 'src/shared/modules/database/dynamo/client';
import { CreateProfileUseCase } from 'src/user/domain/use-cases/create-profile/create-profile.use-case';

import { DynamoUserRepository } from '../../../database/dynamo/users-repository.dynamo';

export function makeCreateProfileUseCase() {
  const dynamoModule = new DynamoModule();
  const usersRepository = new DynamoUserRepository(dynamoModule);
  const createProfileUseCase = new CreateProfileUseCase(usersRepository);
  return createProfileUseCase;
}
