export const EmailAlreadyVerifiedException = (email: string) => {
  const error = new Error(`Email not verified: ${email}`);
  error.name = 'EmailNotVerifiedException';
  return error;
};
