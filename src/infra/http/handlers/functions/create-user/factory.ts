import { CreateUserUseCase } from '../../../../../core/use-cases/user/create-user/create-user.use-case';
import { AwsCognitoService } from '../../../../aws/aws-cognito-client';
import { DynamoUserRepository } from '../../../../database/dynamo/users-repository.dynamo';

export function makeRegisterUseCase() {
  const profileRepository = new DynamoUserRepository();
  const cognitoService = new AwsCognitoService();
  const createUserUseCase = new CreateUserUseCase(
    profileRepository,
    cognitoService,
  );
  return createUserUseCase;
}
