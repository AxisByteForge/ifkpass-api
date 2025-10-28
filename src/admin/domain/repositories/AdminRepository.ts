import { Admin } from '../entities/Admin.entity';

export interface AdminRepository {
  findByEmail(email: string): Promise<Admin | null>;
  findById(adminId: string): Promise<Admin | null>;
  create(admin: Admin): Promise<void>;
}
