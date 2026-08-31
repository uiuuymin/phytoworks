import { describe, expect, it } from "vitest";
import { ProductController } from "./product.controller.js";
import { ProductService } from "./product.service.js";

describe("ProductController", () => {
  const controller = new ProductController(new ProductService());

  it("returns the Product list envelope", () => {
    expect(controller.getProducts()).toEqual({
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

  it("returns the Product detail read model", () => {
    expect(controller.getProduct("chlorophyll-fluorescence")).toMatchObject({
      id: "chlorophyll-fluorescence",
      name: "Chlorophyll Fluorescence Module",
      summary: expect.any(String),
      features: expect.any(Array),
      purchaseMode: "DIRECT_PURCHASE",
    });
  });
});
