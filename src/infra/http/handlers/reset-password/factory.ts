import { DynamoModule } from '@/shared/modules/database/dynamo/client';
import { CognitoModule } from '@/shared/modules/identity-provider/cognito/client';
import { ResetPasswordUseCase } from '@/core/use-cases/reset-password/reset-password.use-case';

import { AwsCognitoService } from '@/infra/aws/aws-cognito-client';
import { DynamoUserRepository } from '@/infra/database/dynamo/users-repository.dynamo';

export function factory() {
  const dynamoModule = new DynamoModule();
  const cognitoModule = new CognitoModule();

  const userRepository = new DynamoUserRepository(dynamoModule);
  const cognitoService = new AwsCognitoService(cognitoModule);
  const resetPasswordUseCase = new ResetPasswordUseCase(
    userRepository,
    cognitoService
  );
  return resetPasswordUseCase;
}
