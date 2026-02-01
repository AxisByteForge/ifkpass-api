export interface ResetPasswordInput {
  email: string;
  code: string;
  newPassword: string;
}

export interface ResetPasswordOutput {
  message: string;
}
