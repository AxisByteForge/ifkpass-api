import { z } from 'zod';

import { envs } from './env';

const envSchema = z.object(envs);

export class Config {
  private config: z.infer<typeof envSchema>;

  constructor() {
    const parsed = envSchema.safeParse(process.env);

    if (!parsed.success) {
      throw new Error(
        `Invalid environment variables: ${JSON.stringify(parsed.error.format())}`,
      );
    }

    this.config = parsed.data;
  }

  get<Key extends keyof typeof envs>(env: Key): z.infer<typeof envSchema>[Key] {
    const value = this.config[env];

    if (value === undefined) {
      throw new Error(`Environment variable ${String(env)} is not defined.`);
    }

    return value;
  }
}
