import { eq } from 'drizzle-orm';
import { db } from '@/shared/lib/db';

import { Admin, admins, users } from '../../schemas';
import { AdminsDbData } from './admins-db.interface';

const userDbData = (admin: Admin): AdminsDbData => ({
  Id: admin.id,
  name: admin.name || '',
  lastName: admin.lastName || '',
  email: admin.email || '',
  cpf: admin.cpf || '',
  phone: admin.phone || '',
  createdAt: admin.createdAt?.toISOString() || new Date().toISOString()
});

export const findAdminByEmail = async (
  email: string
): Promise<AdminsDbData | null> => {
  const admin = await db
    .select()
    .from(admins)
    .where(eq(admins.email, email))
    .limit(1);

  if (!admin || admin.length === 0) return null;

  return userDbData(admin[0]);
};

export const updateUserStatus = async (
  Id: string,
  status: string
): Promise<void> => {
  await db
    .update(users)
    .set({
      status,
      updatedAt: new Date()
    })
    .where(eq(users.id, Id));
};
