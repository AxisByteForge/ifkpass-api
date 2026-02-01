export interface AuthTokensData {
  Id: string;
  userId: string | null;
  adminId: string | null;
  token: string;
  type: string;
  used: boolean;
  expiresAt: Date;
  createdAt: Date;
}

export type CreateAuthTokenParams = {
  userId?: string | null;
  adminId?: string | null;
  token: string;
  type: string;
  expiresAt: Date;
};
