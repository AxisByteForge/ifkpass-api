export class UserNotApprovedException extends Error {
  constructor() {
    super('User account is pending approval from an administrator.');
    this.name = 'UserNotApprovedException';
  }
}
