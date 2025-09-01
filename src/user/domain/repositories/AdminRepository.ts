import { Profile } from '../entities/Profile.entity';
import { User } from '../entities/User.entity';

export interface UserRepository {
  findByEmail(id: string): Promise<User | null>;
  create(user: User): Promise<void>;
  createProfile(profileData: Profile): Promise<void>;
}
