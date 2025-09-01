import { z } from 'zod';

export const createAdminValidate = z.object({
  name: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  password: z.string(),
});
