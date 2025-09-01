import { CreateAdminUseCase } from 'src/admin/domain/use-cases/create-admin/create-admin.use-case';
import { DynamoModule } from 'src/shared/modules/database/dynamo/client';
import { CognitoModule } from 'src/shared/modules/identity-provider/cognito/client';

import { AwsCognitoService } from '../../../aws/aws-cognito-client';
import { DynamoAdminRepository } from '../../../database/dynamo/admin-repository.dynamo';

export function makeCreateAdminUseCase() {
  const dynamoModule = new DynamoModule();
  const cognitoModule = new CognitoModule();

  const adminRepository = new DynamoAdminRepository(dynamoModule);
  const cognitoService = new AwsCognitoService(cognitoModule);
  const createAdminUseCase = new CreateAdminUseCase(
    adminRepository,
    cognitoService,
  );
  return createAdminUseCase;
}
