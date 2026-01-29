export class UserNotFoundException extends Error {
  constructor(identifier: string) {
    super(`User "${identifier}" not found.`);
  }
}
