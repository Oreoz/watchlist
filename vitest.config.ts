import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      provider: "v8",
      reporter: ["text", "json-summary", "json"],
      reportOnFailure: true,
    },
    env: {
      NODE_OPTIONS: "--no-webstorage",
    },
    globals: true,
  },
});
