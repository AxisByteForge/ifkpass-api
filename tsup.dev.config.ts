import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist',
  format: ['cjs'],
  target: 'node24',
  platform: 'node',
  splitting: false,
  sourcemap: true,
  dts: false,
  clean: true,
  external: [
    /^@aws-sdk\//,
    /@\/infra\/database/,
    /@\/services\//,
    /@\/shared\//
  ],
  tsconfig: './tsconfig.json'
});
