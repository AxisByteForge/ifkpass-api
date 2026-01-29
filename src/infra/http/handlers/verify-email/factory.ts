import { DynamoModule } from '@/shared/modules/database/dynamo/client';
import { CognitoModule } from '@/shared/modules/identity-provider/cognito/client';
import { VerifyEmailUseCase } from '@/core/use-cases/verify-email/verify-email.use-case';

import { AwsCognitoService } from '@/infra/aws/aws-cognito-client';
import { DynamoUserRepository } from '@/infra/database/dynamo/users-repository.dynamo';

export function factory() {
  const dynamoModule = new DynamoModule();
  const cognitoModule = new CognitoModule();
  const profileRepository = new DynamoUserRepository(dynamoModule);
  const cognitoService = new AwsCognitoService(cognitoModule);
  const createUserUseCase = new VerifyEmailUseCase(
    profileRepository,
    cognitoService
  );
  return createUserUseCase;
}
