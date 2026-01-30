import {
  SignUpCommand,
  AdminConfirmSignUpCommand,
  AdminAddUserToGroupCommand,
  InitiateAuthCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  ConfirmSignUpCommand
} from '@aws-sdk/client-cognito-identity-provider';
import crypto from 'node:crypto';
import {
  cognitoClient,
  getCognitoConfig
} from '@/shared/lib/aws/cognito-client';

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

export const signInUser = async (
  userId: string,
  password: string
): Promise<string> => {
  const { clientId, clientSecret } = getCognitoConfig();
  const secretHash = generateSecretHash(clientSecret, userId, clientId);

  const response = await cognitoClient.send(
    new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: clientId,
      AuthParameters: {
        USERNAME: userId,
        PASSWORD: password,
        SECRET_HASH: secretHash
      }
    })
  );

  const token = response.AuthenticationResult?.IdToken;
  if (!token) throw new Error('Login failed');

  return token;
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

export const forgotPasswordCognito = async (email: string): Promise<void> => {
  const { clientId, clientSecret } = getCognitoConfig();
  const secretHash = generateSecretHash(clientSecret, email, clientId);

  await cognitoClient.send(
    new ForgotPasswordCommand({
      ClientId: clientId,
      Username: email,
      SecretHash: secretHash
    })
  );
};

export const confirmPasswordResetCognito = async (
  email: string,
  code: string,
  newPassword: string
): Promise<void> => {
  const { clientId, clientSecret } = getCognitoConfig();
  const secretHash = generateSecretHash(clientSecret, email, clientId);

  await cognitoClient.send(
    new ConfirmForgotPasswordCommand({
      ClientId: clientId,
      Username: email,
      ConfirmationCode: code,
      Password: newPassword,
      SecretHash: secretHash
    })
  );
};

export const confirmEmailCognito = async (
  userId: string,
  code: string
): Promise<void> => {
  const { clientId, clientSecret } = getCognitoConfig();
  const secretHash = generateSecretHash(clientSecret, userId, clientId);

  await cognitoClient.send(
    new ConfirmSignUpCommand({
      ClientId: clientId,
      Username: userId,
      ConfirmationCode: code,
      SecretHash: secretHash
    })
  );
};
