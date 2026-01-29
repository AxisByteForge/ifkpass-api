export class UserAlreadyExistsException extends Error {
  constructor(identifier: string) {
    super(`User "${identifier}" already exists.`);
  }
}
