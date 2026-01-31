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
  const admin = await findUserById(input.adminId);

  if (!admin || !admin.isAdmin) {
    throw new Error('Usuário não possui privilégios de administrador');
  }

  const user = await findUserById(input.Id);

  if (!user) {
    throw new Error(`Usuário com ID ${input.Id} não encontrado`);
  }

  await updateUserStatus(input.Id, input.status);

  return {
    message: `User ${input.status === 'approved' ? 'approved' : 'rejected'} successfully`
  };
};
