import {
  AdminGetUserCommand,
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
  ConfirmForgotPasswordCommand,
  ForgotPasswordCommand,
  InitiateAuthCommand,
  SignUpCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import crypto from 'node:crypto';

import { Config } from '../../shared/lib/config/env/get-env';
import { CognitoModule } from '../../shared/modules/identity-provider/cognito/client';
import { UserIdentityProviderServiceAdapter } from '../../core/domain/adapters/aws-cognito-adapter';

const config = new Config();

export class AwsCognitoService implements UserIdentityProviderServiceAdapter {
  private readonly client: CognitoIdentityProviderClient;
  private readonly clientId: string;
  private readonly secret: string;
  private readonly userPoolId: string;

  constructor(cognito: CognitoModule) {
    this.client = cognito.getClient();

    this.clientId = config.get('COGNITO_CLIENT_ID');
    this.secret = config.get('COGNITO_CLIENT_SECRET');
    this.userPoolId = config.get('COGNITO_USER_POOL_ID');
  }

  private generateSecretHash(
    clientSecret: string,
    attr: string,
    clientId: string,
  ) {
    const hash = crypto
      .createHmac('SHA256', clientSecret)
      .update(attr + clientId)
      .digest('base64');

    return hash;
  }

  async signUp(userId: string, email: string, password: string) {
    const hash = this.generateSecretHash(this.secret, userId, this.clientId);

    const command = new SignUpCommand({
      ClientId: this.clientId,
      Username: userId,
      Password: password,
      SecretHash: hash,
      UserAttributes: [{ Name: 'email', Value: email }],
    });

    await this.client.send(command);
  }

  async signIn(userId: string, password: string): Promise<string> {
    const hash = this.generateSecretHash(this.secret, userId, this.clientId);

    const command = new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: this.clientId,
      AuthParameters: {
        USERNAME: userId,
        PASSWORD: password,
        SECRET_HASH: hash,
      },
    });

    const response = await this.client.send(command);

    const token = response.AuthenticationResult?.IdToken;
    if (!token) throw new Error('Login failed');

    return token;
  }

  async isEmailVerified(email: string) {
    const command = new AdminGetUserCommand({
      Username: email,
      UserPoolId: this.userPoolId,
    });

    const response = await this.client.send(command);

    const emailVerified = response.UserAttributes?.find(
      (attr) => attr.Name === 'email_verified',
    )?.Value;

    return emailVerified === 'true';
  }

  async confirmEmail(userId: string, code: string) {
    const hash = this.generateSecretHash(this.secret, userId, this.clientId);

    const command = new ConfirmSignUpCommand({
      ClientId: this.clientId,
      Username: userId,
      ConfirmationCode: code,
      SecretHash: hash,
    });

    await this.client.send(command);
  }

  async getUserId(email: string): Promise<string | null> {
    const command = new AdminGetUserCommand({
      Username: email,
      UserPoolId: this.userPoolId,
    });

    const response = await this.client.send(command);

    return response.Username ?? '';
  }

  async forgotPassword(email: string): Promise<void> {
    const hash = this.generateSecretHash(this.secret, email, this.clientId);

    const command = new ForgotPasswordCommand({
      ClientId: this.clientId,
      Username: email,
      SecretHash: hash,
    });

    await this.client.send(command);
  }

  async confirmPasswordReset(
    email: string,
    code: string,
    newPassword: string,
  ): Promise<void> {
    const hash = this.generateSecretHash(this.secret, email, this.clientId);

    const command = new ConfirmForgotPasswordCommand({
      ClientId: this.clientId,
      Username: email,
      ConfirmationCode: code,
      Password: newPassword,
      SecretHash: hash,
    });

    await this.client.send(command);
  }
}
