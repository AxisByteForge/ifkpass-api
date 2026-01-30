export const UserNotFoundException = (identifier: string) => {
  const error = new Error(`User "${identifier}" not found.`);
  error.name = 'UserNotFoundException';
  return error;
};
