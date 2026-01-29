import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    exclude: [
      'dist',
      '**/dist/**',
      '**/vitest.config.*',
      'src/**/*.interface.*'
    ],
    coverage: {
      reporter: ['text', 'html', 'lcov'],
      include: ['src'],
      exclude: ['**/*.test.ts', '**/*.spec.ts', 'src/**/*.interface.*'],
      all: true
    }
  },
  plugins: [swc.vite({ module: { type: 'es6' } })]
});
