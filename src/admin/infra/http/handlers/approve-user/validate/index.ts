import { z } from 'zod';

export const approveUserValidate = z.object({
  userId: z.string().uuid(),
  status: z.enum(['approved', 'rejected']),
});
