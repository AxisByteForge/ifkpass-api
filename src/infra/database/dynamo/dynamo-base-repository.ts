import {
  PutItemCommand,
  UpdateItemCommand,
  QueryCommand,
  PutItemCommandInput,
  UpdateItemCommandInput,
  QueryCommandInput,
  DynamoDBClient,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

import { Config } from '../../../shared/common/config/env/get-env';

const config = new Config();
class DynamoBaseRepository {
  protected readonly dynamoClient: DynamoDBClient;

  constructor() {
    this.dynamoClient = new DynamoDBClient({
      region: config.get('REGION'),
    });
  }

  public async query<T>(commandInput: QueryCommandInput): Promise<T | null> {
    const command = new QueryCommand(commandInput);
    const response = await this.dynamoClient.send(command);
    const item = response.Items?.[0];
    return item ? (unmarshall(item) as T) : null;
  }

  protected async putItem(
    tableName: string,
    item: Record<string, any>,
  ): Promise<void> {
    const commandInput: PutItemCommandInput = {
      TableName: tableName,
      Item: marshall(item, {
        removeUndefinedValues: true,
        convertClassInstanceToMap: true,
      }),
    };
    const command = new PutItemCommand(commandInput);
    await this.dynamoClient.send(command);
  }

  protected async updateItem(
    commandInput: UpdateItemCommandInput,
  ): Promise<void> {
    const command = new UpdateItemCommand(commandInput);
    await this.dynamoClient.send(command);
  }
}

export { DynamoBaseRepository };
