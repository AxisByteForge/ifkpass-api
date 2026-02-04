export interface ApproveUserInput {
  userId: string;
  status: 'approved' | 'rejected';
}

export interface ApproveUserOutput {
  message: string;
}
