import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/infra/http/handlers/proxy/index.ts'],
  outDir: 'dist',
  format: ['esm'],
  target: 'node22',
  platform: 'node',
  splitting: false,
  sourcemap: false,
  dts: false,
  clean: true,
  external: [/^@aws-sdk\//],
});
