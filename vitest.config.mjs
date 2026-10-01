import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/scripts/**/*.spec.mjs'],
    environment: 'node',
    fileParallelism: false,
    testTimeout: 30000,
  },
});
