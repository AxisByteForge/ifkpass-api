import { DynamoModule } from 'src/shared/modules/database/dynamo/client';
import { CognitoModule } from 'src/shared/modules/identity-provider/cognito/client';
import { AuthenticateUseCase } from '../../../../core/use-cases/authenticate/authenticate.use-case';

import { AwsCognitoService } from '../../../aws/aws-cognito-client';
import { DynamoUserRepository } from '../../../database/dynamo/users-repository.dynamo';

export function factory() {
  const dynamoModule = new DynamoModule();
  const cognitoModule = new CognitoModule();
  const profileRepository = new DynamoUserRepository(dynamoModule);
  const cognitoService = new AwsCognitoService(cognitoModule);
  const authenticateUseCase = new AuthenticateUseCase(
    profileRepository,
    cognitoService,
  );
  return authenticateUseCase;
}
