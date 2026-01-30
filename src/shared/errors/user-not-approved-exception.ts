export const UserNotApprovedException = () => {
  const error = new Error(
    'User account is pending approval from an administrator.'
  );
  error.name = 'UserNotApprovedException';
  return error;
};
