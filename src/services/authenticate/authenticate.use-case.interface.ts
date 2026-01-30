export interface AuthenticateInput {
  email: string;
  password: string;
}

export interface AuthenticateOutput {
  statusCode: number;
  token: string;
}
