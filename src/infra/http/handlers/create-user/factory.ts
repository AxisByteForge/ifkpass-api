import { DynamoModule } from 'src/shared/modules/database/dynamo/client';
import { CognitoModule } from 'src/shared/modules/identity-provider/cognito/client';
import { CreateUserUseCase } from '../../../../core/use-cases/create-user/create-user.use-case';

import { AwsCognitoService } from '../../../aws/aws-cognito-client';
import { DynamoUserRepository } from '../../../database/dynamo/users-repository.dynamo';

export function makeRegisterUseCase() {
  const dynamoModule = new DynamoModule();
  const cognitoModule = new CognitoModule();

  const userRepository = new DynamoUserRepository(dynamoModule);
  const cognitoService = new AwsCognitoService(cognitoModule);
  const createUserUseCase = new CreateUserUseCase(
    userRepository,
    cognitoService,
  );
  return createUserUseCase;
}
