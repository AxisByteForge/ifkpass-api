import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { Config } from '@/shared/lib/config/env/get-env';

const config = new Config();

// Client singleton (warm start optimization)
export const dynamoClient = new DynamoDBClient({
  region: config.get('REGION')
});

export const getTableName = () => config.get('USERS_TABLE_NAME');
