import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    // environment: "jsdom",
    coverage: {
      enabled: true,
      provider: "istanbul",
      reporter: ["text", "text-summary", "lcov", "json", "json-summary"],
      reportsDirectory: "./coverage",
      reportOnFailure: true,
    },
  },
});
