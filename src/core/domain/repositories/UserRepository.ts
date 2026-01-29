import { UserStatus, User, PaymentDetails } from '../entities/User.entity';

export interface UserRepository {
  findByEmail(id: string): Promise<User | null>;
  findById(Id: string): Promise<User | null>;
  create(user: User): Promise<void>;
  update(user: User): Promise<void>;
  updateStatus(Id: string, status: UserStatus): Promise<void>;
  updatePaymentDetails(
    Id: string,
    paymentDetails: PaymentDetails,
  ): Promise<void>;
}
