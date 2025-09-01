import { z } from 'zod';

export const profileValidate = z.object({
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato inválido'),
  city: z.string().min(1),
  cpf: z.string().min(11).max(14),
  dojo: z.string().min(1),
  rank: z.string().min(1),
  sensei: z.string().min(1),
  photoUrl: z.string().url(),
});
