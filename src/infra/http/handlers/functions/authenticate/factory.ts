import { AuthenticateUseCase } from '../../../../../core/use-cases/user/authenticate/authenticate.use-case';
import { AwsCognitoService } from '../../../../aws/aws-cognito-client';
import { DynamoUserRepository } from '../../../../database/dynamo/users-repository.dynamo';

export function factory() {
  const profileRepository = new DynamoUserRepository();
  const cognitoService = new AwsCognitoService();
  const authenticateUseCase = new AuthenticateUseCase(
    profileRepository,
    cognitoService,
  );
  return authenticateUseCase;
}
