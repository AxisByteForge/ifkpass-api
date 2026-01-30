import { z } from 'zod';

import { envs } from './env';

const envSchema = z.object(envs);

type EnvConfig = z.infer<typeof envSchema>;

let configCache: EnvConfig | null = null;

const loadConfig = (): EnvConfig => {
  if (configCache) return configCache;

  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    throw new Error(
      `Invalid environment variables: ${JSON.stringify(parsed.error.format())}`
    );
  }

  configCache = parsed.data;
  return configCache;
};

export const getConfig = <Key extends keyof typeof envs>(
  env: Key
): EnvConfig[Key] => {
  const config = loadConfig();
  const value = config[env];

  if (value === undefined) {
    throw new Error(`Environment variable ${String(env)} is not defined.`);
  }

  return value;
};
