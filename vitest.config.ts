import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: [
      "packages/**/tests/**/*.test.ts",
      "apps/**/tests/**/*.test.ts",
    ],
    exclude: [
      "_upstream/**",
      "node_modules/**",
      "dist/**",
    ],
    testTimeout: 10_000,
    hookTimeout: 10_000,
  },
});
