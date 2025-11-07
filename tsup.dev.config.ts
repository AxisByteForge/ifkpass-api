import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/infra/http/handlers/proxy/index.ts'],
  outDir: 'dist',
  format: ['cjs'],
  target: 'node22',
  platform: 'node',
  splitting: false,
  sourcemap: true,
  dts: false,
  clean: true,
  external: [/^@aws-sdk\//],
});
