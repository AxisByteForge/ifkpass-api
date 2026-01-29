import { z } from 'zod';

export const createUserValidate = z.object({
  name: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  password: z.string(),
  isAdmin: z.boolean().optional().default(false)
});
