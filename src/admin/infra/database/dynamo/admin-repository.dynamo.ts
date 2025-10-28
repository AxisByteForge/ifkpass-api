import {
  PutItemCommand,
  QueryCommand,
  GetItemCommand,
  DynamoDBClient,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

import { Admin } from 'src/admin/domain/entities/Admin.entity';
import { toDomain, toPersistence } from 'src/shared/utils/domain-mapper';

import { Config } from '../../../../shared/lib/config/env/get-env';
import { DynamoModule } from '../../../../shared/modules/database/dynamo/client';
import { AdminRepository } from '../../../domain/repositories/AdminRepository';

const config = new Config();

class DynamoAdminRepository implements AdminRepository {
  private readonly tableName: string;
  private readonly client: DynamoDBClient;

  constructor(dynamo: DynamoModule) {
    this.client = dynamo.getClient();
    this.tableName = `${config.get('ADMINS_TABLE_NAME')}-${config.get('STAGE')}`;
  }

  public async findByEmail(email: string): Promise<Admin | null> {
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

    return toDomain(result.Items[0], Admin);
  }

  public async findById(adminId: string): Promise<Admin | null> {
    const result = await this.client.send(
      new GetItemCommand({
        TableName: this.tableName,
        Key: { adminId: { S: adminId } },
      }),
    );

    if (!result.Item) return null;

    const raw = unmarshall(result.Item);
    return toDomain(raw, Admin);
  }

  public async create(admin: Admin): Promise<void> {
    const persistenceProps = toPersistence(admin);

    await this.client.send(
      new PutItemCommand({
        TableName: this.tableName,
        Item: marshall(persistenceProps, { removeUndefinedValues: true }),
      }),
    );
  }
}

export { DynamoAdminRepository };
