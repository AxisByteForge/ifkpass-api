import { z } from 'zod';

export const forgotPasswordValidate = z.object({
  email: z.string().email()
});
