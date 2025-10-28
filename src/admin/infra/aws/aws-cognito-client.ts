import {
  AdminAddUserToGroupCommand,
  AdminConfirmSignUpCommand,
  AdminGetUserCommand,
  AdminUpdateUserAttributesCommand,
  CognitoIdentityProviderClient,
  CreateGroupCommand,
  SignUpCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import crypto from 'node:crypto';

import { AdminIdentityProviderServiceAdapter } from 'src/admin/domain/adapters/aws-cognito-adapter';

import { Config } from '../../../shared/lib/config/env/get-env';
import { CognitoModule } from '../../../shared/modules/identity-provider/cognito/client';

const config = new Config();

export class AwsCognitoService implements AdminIdentityProviderServiceAdapter {
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

  async signUp(email: string, password: string, adminId: string) {
    const hash = this.generateSecretHash(this.secret, adminId, this.clientId);

    const command = new SignUpCommand({
      ClientId: this.clientId,
      Username: adminId,
      Password: password,
      SecretHash: hash,
      UserAttributes: [
        {
          Name: 'email',
          Value: email,
        },
      ],
    });

    await this.client.send(command);
  }

  async confirmEmailWithoutCode(adminId: string): Promise<void> {
    await this.client.send(
      new AdminUpdateUserAttributesCommand({
        UserPoolId: this.userPoolId,
        Username: adminId,
        UserAttributes: [
          {
            Name: 'email_verified',
            Value: 'true',
          },
        ],
      }),
    );

    await this.client.send(
      new AdminConfirmSignUpCommand({
        UserPoolId: this.userPoolId,
        Username: adminId,
      }),
    );
  }

  async getUserId(email: string): Promise<string | null> {
    const command = new AdminGetUserCommand({
      Username: email,
      UserPoolId: this.userPoolId,
    });

    const response = await this.client.send(command);

    return response.Username ?? '';
  }

  async promoteAdmin(adminId: string): Promise<void> {
    await this.client.send(
      new CreateGroupCommand({
        GroupName: 'Admin',
        UserPoolId: this.userPoolId,
      }),
    );

    await this.client.send(
      new AdminAddUserToGroupCommand({
        Username: adminId,
        GroupName: 'Admin',
        UserPoolId: this.userPoolId,
      }),
    );
  }
}
