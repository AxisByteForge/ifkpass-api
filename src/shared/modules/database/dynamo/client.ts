import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

import { Config } from '../../../lib/config/env/get-env';

const config = new Config();

export class DynamoModule {
  protected readonly client: DynamoDBClient;

  constructor() {
    this.client = new DynamoDBClient({
      region: config.get('REGION')
    });
  }

  public getClient(): DynamoDBClient {
    return this.client;
  }
}

export const dynamoClient = new DynamoModule().getClient();
