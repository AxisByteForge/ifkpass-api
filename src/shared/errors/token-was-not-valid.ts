export class TokenWasNotValidError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TokenWasNotValidError';
  }
}
