import {
  AdminGetUserCommand,
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  SignUpCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import crypto from 'node:crypto';

import { IdentityProviderServiceAdapter } from '../../core/domain/adapters/aws/aws-cognito-adapter';
import { Config } from '../../shared/common/config/env/get-env';

const config = new Config();

export class AwsCognitoService implements IdentityProviderServiceAdapter {
  private readonly cognitoClient: CognitoIdentityProviderClient;
  private readonly clientId: string;
  private readonly secret: string;
  private readonly userPoolId: string;

  constructor() {
    this.cognitoClient = new CognitoIdentityProviderClient({
      region: config.get('REGION'),
    });

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

  async signUp(email: string, password: string) {
    const hash = this.generateSecretHash(this.secret, email, this.clientId);

    const command = new SignUpCommand({
      ClientId: this.clientId,
      Username: email,
      Password: password,
      SecretHash: hash,
    });

    await this.cognitoClient.send(command);
  }

  async signIn(email: string, password: string): Promise<string> {
    const hash = this.generateSecretHash(this.secret, email, this.clientId);

    const command = new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: this.clientId,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
        SECRET_HASH: hash,
      },
    });

    const response = await this.cognitoClient.send(command);

    const token = response.AuthenticationResult?.IdToken;
    if (!token) throw new Error('Login failed');

    return token;
  }

  async confirmEmail(email: string, code: string) {
    const hash = this.generateSecretHash(this.secret, email, this.clientId);

    const command = new ConfirmSignUpCommand({
      ClientId: this.clientId,
      Username: email,
      ConfirmationCode: code,
      SecretHash: hash,
    });

    await this.cognitoClient.send(command);
  }

  async isEmailVerified(email: string) {
    const command = new AdminGetUserCommand({
      Username: email,
      UserPoolId: this.userPoolId,
    });

    const response = await this.cognitoClient.send(command);

    const emailVerified = response.UserAttributes?.find(
      (attr) => attr.Name === 'email_verified',
    )?.Value;

    return emailVerified === 'true';
  }

  async getUserId(email: string): Promise<string | null> {
    const command = new AdminGetUserCommand({
      Username: email,
      UserPoolId: this.userPoolId,
    });

    const response = await this.cognitoClient.send(command);

    return response.Username ?? '';
  }
}
