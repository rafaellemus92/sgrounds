import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    // scoreAligner uses DOMParser; everything else is pure. jsdom gives us
    // both at once without per-test environment juggling.
    environment: 'jsdom',
    include: ['lib/piano/__tests__/**/*.test.ts'],
  },
});
