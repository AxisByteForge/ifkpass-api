import { DynamoModule } from '@/shared/modules/database/dynamo/client';
import { ApproveUserUseCase } from '@/core/use-cases/approve-user/approve-user.use-case';
import { DynamoUserRepository } from '@/infra/database/dynamo/users-repository.dynamo';

export function makeApproveUserUseCase() {
  const dynamoModule = new DynamoModule();
  const userRepository = new DynamoUserRepository(dynamoModule);

  return new ApproveUserUseCase(userRepository);
}
