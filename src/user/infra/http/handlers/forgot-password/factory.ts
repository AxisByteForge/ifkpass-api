import { DynamoModule } from 'src/shared/modules/database/dynamo/client';
import { CognitoModule } from 'src/shared/modules/identity-provider/cognito/client';
import { ForgotPasswordUseCase } from 'src/user/domain/use-cases/forgot-password/forgot-password.use-case';

import { AwsCognitoService } from '../../../aws/aws-cognito-client';
import { DynamoUserRepository } from '../../../database/dynamo/users-repository.dynamo';

export function factory() {
  const dynamoModule = new DynamoModule();
  const cognitoModule = new CognitoModule();

  const userRepository = new DynamoUserRepository(dynamoModule);
  const cognitoService = new AwsCognitoService(cognitoModule);
  const forgotPasswordUseCase = new ForgotPasswordUseCase(
    userRepository,
    cognitoService,
  );
  return forgotPasswordUseCase;
}
