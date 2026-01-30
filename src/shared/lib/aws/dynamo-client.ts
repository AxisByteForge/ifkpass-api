import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { getConfig } from '@/shared/lib/config/env/get-env';

export const dynamoClient = new DynamoDBClient({
  region: getConfig('REGION')
});

export const getTableName = () => getConfig('USERS_TABLE_NAME');
