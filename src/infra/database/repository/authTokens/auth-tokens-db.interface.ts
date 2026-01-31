export interface AuthTokensData {
  Id: string;
  userId: string;
  token: string;
  type: string;
  used: boolean;
  expiresAt: Date;
  createdAt: Date;
}

export type CreateAuthTokenParams = {
  userId: string;
  token: string;
  type: string;
  expiresAt: Date;
};
