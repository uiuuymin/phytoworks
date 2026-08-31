import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/product/product.repository.integration.test.ts"],
  },
});
