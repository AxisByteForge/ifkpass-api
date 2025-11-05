import { UserStatus, User } from '../entities/User.entity';

export interface UserRepository {
  findByEmail(id: string): Promise<User | null>;
  findById(userId: string): Promise<User | null>;
  create(user: User): Promise<void>;
  update(user: User): Promise<void>;
  updateStatus(userId: string, status: UserStatus): Promise<void>;
}
