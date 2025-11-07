import { z } from 'zod';

export const envs = {
  PORT: z.coerce.number().optional(),
  NODE_ENV: z.enum(['dev', 'test', 'prd']).default('dev'),
  REGION: z.string().default('us-east-1'),
  STAGE: z.string().default('dev'),
  USERS_TABLE_NAME: z.string(),
  COGNITO_ADMINS_GROUP_NAME: z.string(),
  COGNITO_CLIENT_ID: z.string(),
  COGNITO_CLIENT_SECRET: z.string(),
  COGNITO_USER_POOL_ID: z.string(),
  COGNITO_URL: z.string(),
  PROFILE_BUCKET_NAME: z.string(),
  MERCADO_PAGO_ACCESS_TOKEN: z.string(),
  MERCADO_PAGO_PUBLIC_KEY: z.string(),
  MERCADO_PAGO_WEBHOOK_URL: z.string().url(),
};
