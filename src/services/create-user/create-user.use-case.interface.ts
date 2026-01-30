export interface CreateUserInput {
  name: string;
  lastName: string;
  email: string;
  password: string;
  isAdmin?: boolean;
}

export interface CreateUserOutput {
  userId: string;
}
