export interface AdminIdentityProviderServiceAdapter {
  signUp(email: string, password: string, id: string): Promise<void>;
  confirmEmailWithoutCode(email: string): Promise<void>;
  getUserId(email: string): Promise<string | null>;
  promoteAdmin(adminId: string): Promise<void>;
}
