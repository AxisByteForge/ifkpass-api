import {
  PutItemCommand,
  UpdateItemCommand,
  QueryCommand,
  GetItemCommand,
  DynamoDBClient,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

import { toDomain, toPersistence } from 'src/shared/utils/domain-mapper';

import { Config } from '../../../../shared/lib/config/env/get-env';
import { DynamoModule } from '../../../../shared/modules/database/dynamo/client';
import { Profile } from '../../../domain/entities/Profile.entity';
import { User, UserStatus } from '../../../domain/entities/User.entity';
import { UserRepository } from '../../../domain/repositories/UserRepository';

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

  public async findById(userId: string): Promise<User | null> {
    const result = await this.client.send(
      new GetItemCommand({
        TableName: this.tableName,
        Key: { userId: { S: userId } },
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

  public async createProfile(profile: Profile): Promise<void> {
    const props = profile.getProps();

    await this.client.send(
      new UpdateItemCommand({
        TableName: this.tableName,
        Key: { userId: { S: props.userId } },
        UpdateExpression: `
          SET 
            birthDate = :birthDate,
            city = :city,
            cpf = :cpf,
            dojo = :dojo,
            #rank = :rank,
            sensei = :sensei,
            photoUrl = :photoUrl,
            cardId = :cardId,
            updatedAt = :updatedAt
        `,
        ExpressionAttributeNames: {
          '#rank': 'rank',
        },
        ExpressionAttributeValues: marshall(
          {
            ':birthDate': props.birthDate,
            ':city': props.city,
            ':cpf': props.cpf,
            ':dojo': props.dojo,
            ':rank': props.rank,
            ':sensei': props.sensei,
            ':photoUrl': props.photoUrl,
            ':cardId': props.cardId,
            ':updatedAt': props.updatedAt,
          },
          { removeUndefinedValues: true },
        ),
        ConditionExpression: 'attribute_exists(userId)',
      }),
    );
  }

  public async updateStatus(userId: string, status: UserStatus): Promise<void> {
    await this.client.send(
      new UpdateItemCommand({
        TableName: this.tableName,
        Key: { userId: { S: userId } },
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
        ConditionExpression: 'attribute_exists(userId)',
      }),
    );
  }
}

export { DynamoUserRepository };
