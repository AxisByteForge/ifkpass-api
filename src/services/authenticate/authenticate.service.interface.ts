export interface AuthenticateInput {
  email: string;
  code: string;
}

export interface AuthenticateOutput {
  statusCode: number;
  token: string;
}
