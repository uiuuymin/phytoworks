import {
  NotFoundException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { describe, expect, it } from "vitest";
import { ProductService } from "../product/product.service.js";
import { StaticProductRepository } from "../product/static-product.repository.js";
import type { CartRepository } from "./cart.repository.js";
import { CartService } from "./cart.service.js";
import { InMemoryCartRepository } from "./in-memory-cart.repository.js";

describe("CartService", () => {
  const createService = (
    repository: CartRepository = new InMemoryCartRepository(),
  ) =>
    new CartService(
      repository,
      new ProductService(new StaticProductRepository()),
    );

  it("returns an empty Cart for a new session", async () => {
    await expect(createService().findBySessionId("session-1")).resolves.toEqual(
      {
        items: [],
        totalQuantity: 0,
      },
    );
  });

  it("adds direct-purchase Products and merges repeated items", async () => {
    const service = createService();

    await service.addItem("session-1", "thermal-imaging", 1);
    await expect(
      service.addItem("session-1", "thermal-imaging", 2),
    ).resolves.toEqual({
      items: [{ productId: "thermal-imaging", quantity: 3 }],
      totalQuantity: 3,
    });
  });

  it("rejects unknown and quote-required Products", async () => {
    const service = createService();

    await expect(
      service.addItem("session-1", "unknown-product", 1),
    ).rejects.toThrow(NotFoundException);
    await expect(service.addItem("session-1", "nitro", 1)).rejects.toThrow(
      UnprocessableEntityException,
    );
  });

  it("updates and removes an item", async () => {
    const service = createService();

    await service.addItem("session-1", "thermal-imaging", 2);
    await expect(
      service.setItemQuantity("session-1", "thermal-imaging", 4),
    ).resolves.toMatchObject({ totalQuantity: 4 });
    await expect(
      service.removeItem("session-1", "thermal-imaging"),
    ).resolves.toEqual({ items: [], totalQuantity: 0 });
    await expect(
      service.removeItem("session-1", "thermal-imaging"),
    ).rejects.toThrow(NotFoundException);
  });

  it("hides repository failures from the HTTP error", async () => {
    const repository: CartRepository = {
      findBySessionId: async () => {
        throw new Error("SELECT credential FROM secrets");
      },
      addItem: async () => {
        throw new Error("INSERT secret");
      },
      setItemQuantity: async () => null,
      removeItem: async () => null,
    };

    await expect(
      createService(repository).findBySessionId("session-1"),
    ).rejects.toThrow("Cart data unavailable");
  });
});
