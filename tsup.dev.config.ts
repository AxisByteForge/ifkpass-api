import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/infra/http/handlers/proxy/index.ts'],
  outDir: 'dist',
  format: ['esm'],
  target: 'node22',
  platform: 'node',
  sourcemap: true,
  clean: true,
  splitting: false,
});
