import { ApproveUserUseCase } from 'src/admin/domain/use-cases/approve-user/approve-user.use-case';
import { DynamoAdminRepository } from 'src/admin/infra/database/dynamo/admin-repository.dynamo';
import { DynamoModule } from 'src/shared/modules/database/dynamo/client';
import { DynamoUserRepository } from 'src/user/infra/database/dynamo/users-repository.dynamo';

export function makeApproveUserUseCase() {
  const dynamoModule = new DynamoModule();

  const adminRepository = new DynamoAdminRepository(dynamoModule);
  const userRepository = new DynamoUserRepository(dynamoModule);

  const approveUserUseCase = new ApproveUserUseCase(
    adminRepository,
    userRepository,
  );

  return approveUserUseCase;
}
