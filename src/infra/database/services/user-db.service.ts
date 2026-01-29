import { PutItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { dynamoClient, getTableName } from '../dynamo-client';

export interface UserDbData {
  Id: string;
  name: string;
  lastName: string;
  email: string;
  isAdmin: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const findUserByEmail = async (email: string): Promise<boolean> => {
  const result = await dynamoClient.send(
    new QueryCommand({
      TableName: getTableName(),
      IndexName: 'email-index',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: { ':email': { S: email } },
      Limit: 1
    })
  );

  return !!(result.Items && result.Items.length > 0);
};

export const createUserInDb = async (data: UserDbData): Promise<void> => {
  await dynamoClient.send(
    new PutItemCommand({
      TableName: getTableName(),
      Item: marshall(data, { removeUndefinedValues: true })
    })
  );
};
