import { describe, expect, it } from "vitest";
import { ProductService } from "./product.service.js";
import { StaticProductRepository } from "./static-product.repository.js";

describe("ProductService", () => {
  const createService = () => new ProductService(new StaticProductRepository());

  it("returns all Product fixtures in source order", async () => {
    const service = createService();

    const products = await service.findAll();

    expect(products.map((product) => product.id)).toEqual([
      "nitro",
      "thermal-imaging",
      "chlorophyll-fluorescence",
    ]);
  });

  it("returns a Product by ID", async () => {
    const service = createService();

    await expect(service.findById("thermal-imaging")).resolves.toMatchObject({
      id: "thermal-imaging",
      purchaseMode: "DIRECT_PURCHASE",
    });
  });

  it("throws NotFoundException when the Product does not exist", async () => {
    const service = createService();

    await expect(service.findById("unknown-product")).rejects.toThrow(
      "Product not found",
    );
  });
});
