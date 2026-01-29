export interface UserIdentityProviderServiceAdapter {
  signUp(Id: string, email: string, password: string): Promise<void>;
  signIn(Id: string, password: string): Promise<string>;
  confirmEmail(Id: string, code: string): Promise<void>;
  confirmEmailWithoutCode(Id: string): Promise<void>;
  promoteAdmin(Id: string): Promise<void>;
  getId(email: string): Promise<string | null>;
  forgotPassword(email: string): Promise<void>;
  confirmPasswordReset(
    email: string,
    code: string,
    newPassword: string,
  ): Promise<void>;
}
