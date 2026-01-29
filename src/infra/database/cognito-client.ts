import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { Config } from '@/shared/lib/config/env/get-env';

const config = new Config();

// Client singleton (warm start optimization)
export const cognitoClient = new CognitoIdentityProviderClient({
  region: config.get('REGION')
});

export const getCognitoConfig = () => ({
  clientId: config.get('COGNITO_CLIENT_ID'),
  clientSecret: config.get('COGNITO_CLIENT_SECRET'),
  userPoolId: config.get('COGNITO_USER_POOL_ID'),
  adminGroup: config.get('COGNITO_ADMINS_GROUP_NAME')
});
