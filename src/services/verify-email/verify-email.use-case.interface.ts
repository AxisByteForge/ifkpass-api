export interface VerifyEmailInput {
  Id: string;
  code: string;
}

export interface VerifyEmailOutput {
  message: string;
}
