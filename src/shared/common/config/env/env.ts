import { z } from 'zod';

export const envs = {
  PORT: z.coerce.number().optional(),
  NODE_ENV: z.enum(['dev', 'test', 'prd']).default('dev'),
  REGION: z.string().default('us-east-1'),
  STAGE: z.string().default('dev'),
  USERS_TABLE_NAME: z.string(),
  RESEND_MAIL_API_KEY: z.string(),
  COGNITO_CLIENT_ID: z.string(),
  COGNITO_CLIENT_SECRET: z.string(),
  COGNITO_USER_POOL_ID: z.string(),
  COGNITO_URL: z.string(),
  PROFILE_BUCKET_NAME: z.string(),
};
