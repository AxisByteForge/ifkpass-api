export class AdminAlreadyExistsException extends Error {
  constructor(identifier: string) {
    super(`Admin "${identifier}" already exists.`);
  }
}
