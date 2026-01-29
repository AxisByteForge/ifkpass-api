import {
  SignUpCommand,
  AdminConfirmSignUpCommand,
  AdminAddUserToGroupCommand
} from '@aws-sdk/client-cognito-identity-provider';
import crypto from 'node:crypto';
import { cognitoClient, getCognitoConfig } from '../cognito-client';

const generateSecretHash = (
  clientSecret: string,
  username: string,
  clientId: string
): string => {
  return crypto
    .createHmac('SHA256', clientSecret)
    .update(username + clientId)
    .digest('base64');
};

export const signUpUser = async (
  userId: string,
  email: string,
  password: string
): Promise<void> => {
  const { clientId, clientSecret } = getCognitoConfig();
  const secretHash = generateSecretHash(clientSecret, userId, clientId);

  await cognitoClient.send(
    new SignUpCommand({
      ClientId: clientId,
      Username: userId,
      Password: password,
      SecretHash: secretHash,
      UserAttributes: [{ Name: 'email', Value: email }]
    })
  );
};

export const confirmAndPromoteAdmin = async (userId: string): Promise<void> => {
  const { userPoolId, adminGroup } = getCognitoConfig();

  await Promise.all([
    cognitoClient.send(
      new AdminConfirmSignUpCommand({
        UserPoolId: userPoolId,
        Username: userId
      })
    ),
    cognitoClient.send(
      new AdminAddUserToGroupCommand({
        UserPoolId: userPoolId,
        Username: userId,
        GroupName: adminGroup
      })
    )
  ]);
};
