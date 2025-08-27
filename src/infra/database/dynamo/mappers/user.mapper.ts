import { User } from '../../../../core/domain/entities/User.entity';

export class UserMapper {
  static toDomain(raw: any): User {
    return User.fromPersistence({
      ...raw,
      email: raw.email,
    });
  }

  static toPersistence(user: User): Record<string, any> {
    const { email, ...rest } = user.getProps();

    return {
      ...rest,
      email: email.getValue(),
    };
  }
}
