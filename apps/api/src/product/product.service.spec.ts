import { describe, expect, it } from "vitest";
import { ProductService } from "./product.service.js";

describe("ProductService", () => {
  it("returns all Product fixtures in source order", () => {
    const service = new ProductService();

    expect(service.findAll().map((product) => product.id)).toEqual([
      "nitro",
      "thermal-imaging",
      "chlorophyll-fluorescence",
    ]);
  });

  it("returns a Product by ID", () => {
    const service = new ProductService();

    expect(service.findById("thermal-imaging")).toMatchObject({
      id: "thermal-imaging",
      purchaseMode: "DIRECT_PURCHASE",
    });
  });

  it("throws NotFoundException when the Product does not exist", () => {
    const service = new ProductService();

    expect(() => service.findById("unknown-product")).toThrow(
      "Product not found",
    );
  });
});
