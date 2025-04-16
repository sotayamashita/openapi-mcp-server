import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "istanbul",
      exclude: ["**/node_modules/**", "**/examples/**"],
    },
    exclude: ["**/node_modules/**", "**/examples/**"],
  },
});
