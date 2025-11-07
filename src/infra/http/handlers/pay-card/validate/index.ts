import { z } from 'zod';

export const payCardValidate = z
  .object({
    action: z.enum(['create', 'confirm']).default('create'),
    paymentStatus: z.enum(['approved', 'pending', 'rejected']).optional(),
    paymentId: z.string().trim().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.action === 'confirm' && !value.paymentStatus) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['paymentStatus'],
        message: 'Status do pagamento é obrigatório quando a ação é confirm.',
      });
    }

    if (value.action === 'confirm' && !value.paymentId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['paymentId'],
        message: 'paymentId é obrigatório quando a ação é confirm.',
      });
    }
  });
