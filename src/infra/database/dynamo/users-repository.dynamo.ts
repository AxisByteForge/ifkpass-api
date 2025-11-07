import {
  PutItemCommand,
  UpdateItemCommand,
  QueryCommand,
  GetItemCommand,
  DynamoDBClient,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

import { toDomain, toPersistence } from 'src/shared/utils/domain-mapper';

import { Config } from 'src/shared/lib/config/env/get-env';
import { DynamoModule } from 'src/shared/modules/database/dynamo/client';
import {
  User,
  UserStatus,
  PaymentDetails,
} from '../../../core/domain/entities/User.entity';
import { UserRepository } from '../../../core/domain/repositories/UserRepository';

const config = new Config();

class DynamoUserRepository implements UserRepository {
  private readonly tableName: string;
  private readonly client: DynamoDBClient;

  constructor(dynamo: DynamoModule) {
    this.client = dynamo.getClient();
    this.tableName = `${config.get('USERS_TABLE_NAME')}-${config.get('STAGE')}`;
  }

  public async findByEmail(email: string): Promise<User | null> {
    const result = await this.client.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: 'email-index',
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: {
          ':email': { S: email },
        },
        Limit: 1,
      }),
    );

    if (!result.Items || result.Items.length === 0) return null;

    const raw = unmarshall(result.Items[0]);

    return toDomain(raw, User);
  }

  public async findById(Id: string): Promise<User | null> {
    const result = await this.client.send(
      new GetItemCommand({
        TableName: this.tableName,
        Key: { Id: { S: Id } },
      }),
    );

    if (!result.Item) return null;

    const raw = unmarshall(result.Item);

    return toDomain(raw, User);
  }

  public async create(user: User): Promise<void> {
    const persistenceProps = toPersistence(user);

    await this.client.send(
      new PutItemCommand({
        TableName: this.tableName,
        Item: marshall(persistenceProps, { removeUndefinedValues: true }),
      }),
    );
  }

  public async update(user: User): Promise<void> {
    const persistenceProps = toPersistence(user);

    const setExpressions: string[] = [
      '#name = :name',
      'lastName = :lastName',
      'email = :email',
      'updatedAt = :updatedAt',
      '#status = :status',
    ];

    const expressionAttributeNames: Record<string, string> = {
      '#name': 'name',
      '#status': 'status',
    };

    const expressionAttributeValues: Record<string, unknown> = {
      ':name': persistenceProps.name,
      ':lastName': persistenceProps.lastName,
      ':email': persistenceProps.email,
      ':updatedAt': persistenceProps.updatedAt,
      ':status': persistenceProps.status,
    };

    if (persistenceProps.birthDate !== undefined) {
      setExpressions.push('birthDate = :birthDate');
      expressionAttributeValues[':birthDate'] = persistenceProps.birthDate;
    }

    if (persistenceProps.city !== undefined) {
      setExpressions.push('city = :city');
      expressionAttributeValues[':city'] = persistenceProps.city;
    }

    if (persistenceProps.cpf !== undefined) {
      setExpressions.push('cpf = :cpf');
      expressionAttributeValues[':cpf'] = persistenceProps.cpf;
    }

    if (persistenceProps.dojo !== undefined) {
      setExpressions.push('dojo = :dojo');
      expressionAttributeValues[':dojo'] = persistenceProps.dojo;
    }

    if (persistenceProps.rank !== undefined) {
      setExpressions.push('#rank = :rank');
      expressionAttributeNames['#rank'] = 'rank';
      expressionAttributeValues[':rank'] = persistenceProps.rank;
    }

    if (persistenceProps.sensei !== undefined) {
      setExpressions.push('sensei = :sensei');
      expressionAttributeValues[':sensei'] = persistenceProps.sensei;
    }

    if (persistenceProps.photoUrl !== undefined) {
      setExpressions.push('photoUrl = :photoUrl');
      expressionAttributeValues[':photoUrl'] = persistenceProps.photoUrl;
    }

    if (persistenceProps.cardId !== undefined) {
      setExpressions.push('cardId = :cardId');
      expressionAttributeValues[':cardId'] = persistenceProps.cardId;
    }

    if (persistenceProps.isAdmin !== undefined) {
      setExpressions.push('isAdmin = :isAdmin');
      expressionAttributeValues[':isAdmin'] = persistenceProps.isAdmin;
    }

    if (persistenceProps.paymentDetails !== undefined) {
      setExpressions.push('paymentDetails = :paymentDetails');
      expressionAttributeValues[':paymentDetails'] =
        persistenceProps.paymentDetails;
    }

    await this.client.send(
      new UpdateItemCommand({
        TableName: this.tableName,
        Key: { Id: { S: persistenceProps.Id } },
        UpdateExpression: `SET ${setExpressions.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: marshall(expressionAttributeValues, {
          removeUndefinedValues: true,
        }),
        ConditionExpression: 'attribute_exists(Id)',
      }),
    );
  }

  public async updateStatus(Id: string, status: UserStatus): Promise<void> {
    await this.client.send(
      new UpdateItemCommand({
        TableName: this.tableName,
        Key: { Id: { S: Id } },
        UpdateExpression: `
          SET 
            #status = :status,
            updatedAt = :updatedAt
        `,
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: marshall(
          {
            ':status': status,
            ':updatedAt': new Date().toISOString(),
          },
          { removeUndefinedValues: true },
        ),
        ConditionExpression: 'attribute_exists(Id)',
      }),
    );
  }

  public async updatePaymentDetails(
    Id: string,
    paymentDetails: PaymentDetails,
  ): Promise<void> {
    await this.client.send(
      new UpdateItemCommand({
        TableName: this.tableName,
        Key: { Id: { S: Id } },
        UpdateExpression: `
          SET 
            paymentDetails = :paymentDetails,
            updatedAt = :updatedAt
        `,
        ExpressionAttributeValues: marshall(
          {
            ':paymentDetails': paymentDetails,
            ':updatedAt': new Date().toISOString(),
          },
          { removeUndefinedValues: true },
        ),
        ConditionExpression: 'attribute_exists(Id)',
      }),
    );
  }
}

export { DynamoUserRepository };
