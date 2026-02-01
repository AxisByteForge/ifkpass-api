export class UserNotApprovedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserNotApprovedError';
  }
}
