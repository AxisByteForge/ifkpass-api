export interface CreateProfileInput {
  Id: string;
  body: {
    birthDate: string;
    city: string;
    cpf: string;
    dojo: string;
    rank: string;
    sensei: string;
  };
}

export interface CreateProfileOutput {
  message: string;
}
