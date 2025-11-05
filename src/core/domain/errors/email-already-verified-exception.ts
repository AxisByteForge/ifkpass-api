export class EmailAlreadyVerifiedException extends Error {
  constructor(email: string) {
    super(`Email not verified: ${email}`);
    this.name = 'EmailNotVerifiedException';
  }
}
