import { z } from 'zod';

export const resetPasswordValidate = z.object({
  email: z.string().email(),
  code: z.string().min(6),
  newPassword: z.string().min(8),
});
