import { z } from 'zod';

export const authenticateValidate = z.object({
  email: z.string().email(),
  password: z.string(),
});
