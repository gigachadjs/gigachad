import { defineProject } from "vitest/config";

export default defineProject({
  esbuild: {
    target: "ES2020",
  },
  test: {
    environment: "happy-dom",
  },
});
