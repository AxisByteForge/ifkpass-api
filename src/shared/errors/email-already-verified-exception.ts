export class EmailAlreadyVerifiedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EmailAlreadyVerifiedError';
  }
}
