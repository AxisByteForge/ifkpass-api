import {
  PutItemCommand,
  QueryCommand,
  GetItemCommand,
  UpdateItemCommand
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { dynamoClient, getTableName } from '@/shared/lib/aws/dynamo-client';

export interface UserDbData {
  Id: string;
  name: string;
  lastName: string;
  email: string;
  isAdmin: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  birthDate?: string;
  city?: string;
  cpf?: string;
  dojo?: string;
  rank?: string;
  sensei?: string;
  photoUrl?: string;
  cardId?: string;
  paymentDetails?: {
    alreadyPaid: boolean;
    status: string;
    preferenceId?: string;
    paymentId?: string;
    amount?: number;
    currency?: string;
    discountApplied?: boolean;
    beltCategory?: string;
    rank?: string;
    updatedAt: string;
  };
}

export const findUserByEmail = async (
  email: string
): Promise<UserDbData | null> => {
  const result = await dynamoClient.send(
    new QueryCommand({
      TableName: getTableName(),
      IndexName: 'email-index',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: { ':email': { S: email } },
      Limit: 1
    })
  );

  if (!result.Items || result.Items.length === 0) return null;

  return unmarshall(result.Items[0]) as UserDbData;
};

export const findUserById = async (Id: string): Promise<UserDbData | null> => {
  const result = await dynamoClient.send(
    new GetItemCommand({
      TableName: getTableName(),
      Key: { Id: { S: Id } }
    })
  );

  if (!result.Item) return null;

  return unmarshall(result.Item) as UserDbData;
};

export const createUserInDb = async (data: UserDbData): Promise<void> => {
  await dynamoClient.send(
    new PutItemCommand({
      TableName: getTableName(),
      Item: marshall(data, { removeUndefinedValues: true })
    })
  );
};

export const updateUser = async (
  Id: string,
  data: Partial<UserDbData>
): Promise<void> => {
  const setExpressions: string[] = [];
  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, any> = {};

  if (data.name) {
    setExpressions.push('#name = :name');
    expressionAttributeNames['#name'] = 'name';
    expressionAttributeValues[':name'] = { S: data.name };
  }

  if (data.lastName) {
    setExpressions.push('lastName = :lastName');
    expressionAttributeValues[':lastName'] = { S: data.lastName };
  }

  if (data.email) {
    setExpressions.push('email = :email');
    expressionAttributeValues[':email'] = { S: data.email };
  }

  if (data.status) {
    setExpressions.push('#status = :status');
    expressionAttributeNames['#status'] = 'status';
    expressionAttributeValues[':status'] = { S: data.status };
  }

  if (data.birthDate !== undefined) {
    setExpressions.push('birthDate = :birthDate');
    expressionAttributeValues[':birthDate'] = { S: data.birthDate };
  }

  if (data.city !== undefined) {
    setExpressions.push('city = :city');
    expressionAttributeValues[':city'] = { S: data.city };
  }

  if (data.cpf !== undefined) {
    setExpressions.push('cpf = :cpf');
    expressionAttributeValues[':cpf'] = { S: data.cpf };
  }

  if (data.dojo !== undefined) {
    setExpressions.push('dojo = :dojo');
    expressionAttributeValues[':dojo'] = { S: data.dojo };
  }

  if (data.rank !== undefined) {
    setExpressions.push('#rank = :rank');
    expressionAttributeNames['#rank'] = 'rank';
    expressionAttributeValues[':rank'] = { S: data.rank };
  }

  if (data.sensei !== undefined) {
    setExpressions.push('sensei = :sensei');
    expressionAttributeValues[':sensei'] = { S: data.sensei };
  }

  if (data.photoUrl !== undefined) {
    setExpressions.push('photoUrl = :photoUrl');
    expressionAttributeValues[':photoUrl'] = { S: data.photoUrl };
  }

  if (data.cardId !== undefined) {
    setExpressions.push('cardId = :cardId');
    expressionAttributeValues[':cardId'] = { S: data.cardId };
  }

  if (data.paymentDetails !== undefined) {
    setExpressions.push('paymentDetails = :paymentDetails');
    expressionAttributeValues[':paymentDetails'] = {
      M: marshall(data.paymentDetails)
    };
  }

  setExpressions.push('updatedAt = :updatedAt');
  expressionAttributeValues[':updatedAt'] = {
    S: new Date().toISOString()
  };

  if (setExpressions.length === 0) return;

  await dynamoClient.send(
    new UpdateItemCommand({
      TableName: getTableName(),
      Key: { Id: { S: Id } },
      UpdateExpression: `SET ${setExpressions.join(', ')}`,
      ExpressionAttributeNames:
        Object.keys(expressionAttributeNames).length > 0
          ? expressionAttributeNames
          : undefined,
      ExpressionAttributeValues: expressionAttributeValues
    })
  );
};

export const updateUserStatus = async (
  Id: string,
  status: string
): Promise<void> => {
  await dynamoClient.send(
    new UpdateItemCommand({
      TableName: getTableName(),
      Key: { Id: { S: Id } },
      UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':status': { S: status },
        ':updatedAt': { S: new Date().toISOString() }
      }
    })
  );
};
