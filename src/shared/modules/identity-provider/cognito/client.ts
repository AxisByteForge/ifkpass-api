import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';

import { Config } from '../../../lib/config/env/get-env';

const config = new Config();

export class CognitoModule {
  protected readonly client: CognitoIdentityProviderClient;

  constructor() {
    this.client = new CognitoIdentityProviderClient({
      region: config.get('REGION'),
    });
  }

  public getClient(): CognitoIdentityProviderClient {
    return this.client;
  }
}

export const cognitoClient = new CognitoModule().getClient();
