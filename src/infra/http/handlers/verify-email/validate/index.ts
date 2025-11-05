import { z } from 'zod';

export const verifyEmailValidate = z.object({
  email: z.string().email(),
  emailVerificationCode: z.string().regex(/^\d{6}$/, {
    message: 'O código deve conter exatamente 6 números',
  }),
  password: z.string(),
});
