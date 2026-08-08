import { defineConfig } from "vitest/config";

// No jsdom/happy-dom yet — only pure functions are under test so far. Add a
// `test.environment: "jsdom"` override (globally, or per-file via a
// `// @vitest-environment jsdom` docblock) once component-level tests need
// a DOM.
export default defineConfig({
  test: {
    environment: "node",
  },
});
