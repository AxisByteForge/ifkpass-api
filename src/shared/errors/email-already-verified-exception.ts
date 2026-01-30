export class EmailAlreadyVerifiedException extends Error {
  constructor(email: string) {
    super(`Email already verified: ${email}`);
    this.name = 'EmailAlreadyVerifiedException';
  }
}
