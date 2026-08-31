import { describe, expect, it } from "vitest";
import { ProductController } from "./product.controller.js";
import { ProductService } from "./product.service.js";
import { StaticProductRepository } from "./static-product.repository.js";

describe("ProductController", () => {
  const controller = new ProductController(
    new ProductService(new StaticProductRepository()),
  );

  it("returns the Product list envelope", async () => {
    await expect(controller.getProducts()).resolves.toEqual({
      items: expect.arrayContaining([
        expect.objectContaining({
          id: "nitro",
          summary: expect.any(String),
          features: expect.any(Array),
          purchaseMode: "QUOTE_REQUIRED",
        }),
      ]),
    });
  });

  it("returns the Product detail read model", async () => {
    await expect(
      controller.getProduct("chlorophyll-fluorescence"),
    ).resolves.toMatchObject({
      id: "chlorophyll-fluorescence",
      name: "Chlorophyll Fluorescence Module",
      summary: expect.any(String),
      features: expect.any(Array),
      purchaseMode: "DIRECT_PURCHASE",
    });
  });
});
