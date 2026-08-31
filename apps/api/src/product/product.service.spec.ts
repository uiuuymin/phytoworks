import { InternalServerErrorException } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import type { ProductRepository } from "./product.repository.js";
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
      pricing: {
        mode: "DEMO",
        amount: 5_000_000,
        authoritative: false,
      },
    });
  });

  it("adds catalog pricing and brochure options without stock fields", async () => {
    const service = createService();
    const product = await service.findById("nitro");

    expect(product.pricing).toEqual({
      mode: "QUOTE_REFERENCE",
      currency: "KRW",
      amountFrom: 20_000_000,
      displayLabel: "도입·1년 운영비 2,000만 원부터",
      source: "BROCHURE_REFERENCE",
      authoritative: false,
    });
    expect(product.optionGroups.map((group) => group.id)).toEqual([
      "depth-imaging",
      "irrigation",
      "add-ons",
    ]);
    expect(product.optionGroups[1]).toMatchObject({
      selection: "single",
      options: [
        { id: "drip", label: "점적 관수" },
        { id: "mist", label: "분무경" },
        { id: "sub-irrigation", label: "저면 관수" },
      ],
    });
    expect("stockQuantity" in product).toBe(false);
  });

  it("throws NotFoundException when the Product does not exist", async () => {
    const service = createService();

    await expect(service.findById("unknown-product")).rejects.toThrow(
      "Product not found",
    );
  });

  it("sanitizes repository failures", async () => {
    const repository: ProductRepository = {
      findAll: async () => {
        throw new Error("SELECT password FROM secrets");
      },
      findById: async () => null,
    };
    const service = new ProductService(repository);

    await expect(service.findAll()).rejects.toEqual(
      new InternalServerErrorException("Product data unavailable"),
    );
  });
});
