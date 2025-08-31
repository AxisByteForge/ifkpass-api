import { CreateUserUseCase } from '../../../../../core/use-cases/user/create-user/create-user.use-case';
import { AwsCognitoService } from '../../../../aws/aws-cognito-client';
import { DynamoUserRepository } from '../../../../database/dynamo/users-repository.dynamo';

export function makeCreateAdminUseCase() {
  const adminRepository = new DynamoUserRepository();
  const cognitoService = new AwsCognitoService();
  const createAdminUseCase = new CreateUserUseCase(
    adminRepository,
    cognitoService,
  );
  return createAdminUseCase;
}
