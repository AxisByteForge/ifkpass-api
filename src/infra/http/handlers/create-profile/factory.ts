import { CreateProfileUseCase } from '@/core/use-cases/create-profile/create-profile.use-case';
import { DynamoModule } from '@/shared/modules/database/dynamo/client';

import { DynamoUserRepository } from '@/infra/database/dynamo/users-repository.dynamo';

export function makeCreateProfileUseCase() {
  const dynamoModule = new DynamoModule();
  const usersRepository = new DynamoUserRepository(dynamoModule);
  const createProfileUseCase = new CreateProfileUseCase(usersRepository);
  return createProfileUseCase;
}
