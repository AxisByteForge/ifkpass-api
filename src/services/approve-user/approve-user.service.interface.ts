export interface ApproveUserInput {
  adminId: string;
  Id: string;
  status: 'approved' | 'rejected';
}

export interface ApproveUserOutput {
  message: string;
}
