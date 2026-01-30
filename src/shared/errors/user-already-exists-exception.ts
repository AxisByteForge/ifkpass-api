export const UserAlreadyExistsException = (identifier: string) => {
  const error = new Error(`User "${identifier}" already exists.`);
  error.name = 'UserAlreadyExistsException';
  return error;
};
