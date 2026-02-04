import {
  findUserById,
  updateUserStatus
} from '@/infra/database/repository/user/user-db.service';
import type {
  ApproveUserInput,
  ApproveUserOutput
} from './approve-user.service.interface';

export const approveUser = async (
  input: ApproveUserInput
): Promise<ApproveUserOutput> => {
  const user = await findUserById(input.userId);

  if (!user) {
    throw new Error(`Usuário com ID ${input.userId} não encontrado`);
  }

  await updateUserStatus(input.userId, input.status);

  return {
    message: `User ${input.status === 'approved' ? 'approved' : 'rejected'} successfully`
  };
};
