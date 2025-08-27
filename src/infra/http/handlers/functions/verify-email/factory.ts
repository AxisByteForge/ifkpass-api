import { VerifyEmailUseCase } from '../../../../../core/use-cases/user/verify-email/verify-email.use-case';
import { AwsCognitoService } from '../../../../aws/aws-cognito-client';
import { DynamoUserRepository } from '../../../../database/dynamo/users-repository.dynamo';

export function factory() {
  const profileRepository = new DynamoUserRepository();
  const cognitoService = new AwsCognitoService();
  const createUserUseCase = new VerifyEmailUseCase(
    profileRepository,
    cognitoService,
  );
  return createUserUseCase;
}
