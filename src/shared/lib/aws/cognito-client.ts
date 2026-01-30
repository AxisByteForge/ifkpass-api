import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { getConfig } from '@/shared/lib/config/env/get-env';

export const cognitoClient = new CognitoIdentityProviderClient({
  region: getConfig('REGION')
});

export const getCognitoConfig = () => ({
  clientId: getConfig('COGNITO_CLIENT_ID'),
  clientSecret: getConfig('COGNITO_CLIENT_SECRET'),
  userPoolId: getConfig('COGNITO_USER_POOL_ID'),
  adminGroup: getConfig('COGNITO_ADMINS_GROUP_NAME')
});
