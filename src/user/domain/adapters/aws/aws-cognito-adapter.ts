export interface UserIdentityProviderServiceAdapter {
  signUp(userId: string, email: string, password: string): Promise<void>;
  signIn(userId: string, password: string): Promise<string>;
  confirmEmail(userId: string, code: string): Promise<void>;
  getUserId(email: string): Promise<string | null>;
}
