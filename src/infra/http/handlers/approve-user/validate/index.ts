import { z } from 'zod';

export const approveUserValidate = z.object({
  Id: z.string().uuid(),
  status: z.enum(['approved', 'rejected'])
});
