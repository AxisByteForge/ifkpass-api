import { marshall } from '@aws-sdk/util-dynamodb';

import { DynamoBaseRepository } from './dynamo-base-repository';
import { UserMapper } from './mappers/user.mapper';
import { Profile } from '../../../core/domain/entities/Profile.entity';
import { User } from '../../../core/domain/entities/User.entity';
import { UserRepository } from '../../../core/domain/repositories/UserRepository';
import { Config } from '../../../shared/common/config/env/get-env';

const config = new Config();
class DynamoUserRepository
  extends DynamoBaseRepository
  implements UserRepository
{
  private readonly tableName;

  constructor() {
    super();
    this.tableName = `${config.get('USERS_TABLE_NAME')}-${config.get('STAGE')}`;
  }

  public async findByEmail(email: string): Promise<User | null> {
    const raw = await this.query<User>({
      TableName: this.tableName,
      IndexName: 'email-index',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': { S: email },
      },
    });

    return raw ? UserMapper.toDomain(raw) : null;
  }

  public async create(user: User): Promise<void> {
    const persistenceProps = UserMapper.toPersistence(user);

    await this.putItem(this.tableName, persistenceProps);
  }

  public async updateEmailVerificationStatus(
    userId: string,
    isVerified: boolean,
  ): Promise<void> {
    await this.updateItem({
      TableName: this.tableName,
      Key: { userId: { S: userId } },
      UpdateExpression: 'SET isEmailVerified = :isVerified',
      ExpressionAttributeValues: marshall({
        ':isVerified': isVerified,
      }),
      ConditionExpression: 'attribute_exists(userId)',
    });
  }

  async createProfile(profile: Profile): Promise<void> {
    const props = profile.getProps();

    await this.updateItem({
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
    });
  }
}

export { DynamoUserRepository };
