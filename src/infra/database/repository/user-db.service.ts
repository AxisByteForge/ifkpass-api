import { eq } from 'drizzle-orm';
import { db } from '@/shared/lib/db';
import { User, users } from '../schemas/index';
import { UserDbData } from './user-db.interface';

// Helper to convert User to UserDbData
const userToUserDbData = (user: User): UserDbData => ({
  Id: user.id,
  name: user.name || '',
  lastName: user.lastName || '',
  email: user.email || '',
  isAdmin: user.isAdmin || false,
  status: user.status || 'pending',
  createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
  updatedAt: user.updatedAt?.toISOString() || new Date().toISOString(),
  cpf: user.cpf || undefined,
  phone: user.phone || undefined,
  birthDate: user.birthDate?.toISOString().split('T')[0] || undefined,
  city: user.city || undefined,
  dojo: user.dojo || undefined,
  rank: user.rank || undefined,
  sensei: user.sensei || undefined,
  photoUrl: user.photoUrl || undefined,
  cardId: user.cardId || undefined,
  paymentDetails: user.paymentDetails as UserDbData['paymentDetails']
});

export const findUserByEmail = async (
  email: string
): Promise<UserDbData | null> => {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user || user.length === 0) return null;

  return userToUserDbData(user[0]);
};

export const findUserById = async (Id: string): Promise<UserDbData | null> => {
  const user = await db.select().from(users).where(eq(users.id, Id)).limit(1);

  if (!user || user.length === 0) return null;

  return userToUserDbData(user[0]);
};

export const createUserInDb = async (
  data: Partial<UserDbData>
): Promise<void> => {
  const insertData = {
    id: data.Id,
    name: data.name || '',
    lastName: data.lastName || '',
    email: data.email || '',
    isAdmin: data.isAdmin || false,
    status: data.status || 'pending',
    cpf: data.cpf,
    phone: data.phone,
    birthDate: data.birthDate ? new Date(data.birthDate) : null,
    city: data.city,
    dojo: data.dojo,
    rank: data.rank,
    sensei: data.sensei,
    photoUrl: data.photoUrl,
    cardId: data.cardId,
    paymentDetails: data.paymentDetails || null,
    createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
    updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date()
  };

  await db.insert(users).values(insertData);
};

export const updateUser = async (
  Id: string,
  data: Partial<UserDbData>
): Promise<void> => {
  // Build update object with only provided fields
  const updateData: Partial<User> = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.lastName !== undefined) updateData.lastName = data.lastName;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.isAdmin !== undefined) updateData.isAdmin = data.isAdmin;
  if (data.cpf !== undefined) updateData.cpf = data.cpf;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.birthDate !== undefined)
    updateData.birthDate = data.birthDate ? new Date(data.birthDate) : null;
  if (data.city !== undefined) updateData.city = data.city;
  if (data.dojo !== undefined) updateData.dojo = data.dojo;
  if (data.rank !== undefined) updateData.rank = data.rank;
  if (data.sensei !== undefined) updateData.sensei = data.sensei;
  if (data.photoUrl !== undefined) updateData.photoUrl = data.photoUrl;
  if (data.cardId !== undefined) updateData.cardId = data.cardId;
  if (data.paymentDetails !== undefined)
    updateData.paymentDetails = data.paymentDetails;

  // Always update updatedAt
  updateData.updatedAt = new Date();

  if (Object.keys(updateData).length === 0) return;

  await db.update(users).set(updateData).where(eq(users.id, Id));
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
