import {
  BadRequestException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { describe, expect, it } from "vitest";
import { CartService } from "../cart/cart.service.js";
import { InMemoryCartRepository } from "../cart/in-memory-cart.repository.js";
import { ProductService } from "../product/product.service.js";
import { StaticProductRepository } from "../product/static-product.repository.js";
import { InMemoryOrderRepository } from "./in-memory-order.repository.js";
import { OrderService } from "./order.service.js";

describe("OrderService", () => {
  it("creates a pending Order from the server Cart and clears it", async () => {
    const cartRepository = new InMemoryCartRepository();
    const cartService = new CartService(
      cartRepository,
      new ProductService(new StaticProductRepository()),
    );
    await cartService.addItem("order-test-session", "thermal-imaging", 2);

    const service = new OrderService(
      new InMemoryOrderRepository(cartRepository),
      cartService,
      new ProductService(new StaticProductRepository()),
    );

    await expect(service.createPending("order-test-session")).resolves.toEqual({
      id: "order-test-1",
      status: "PENDING",
      currency: "KRW",
      pricingSource: "DEMO",
      totalAmount: 10_000_000,
      items: [
        {
          productId: "thermal-imaging",
          productName: "Thermal Imaging Module",
          unitAmount: 5_000_000,
          quantity: 2,
          lineAmount: 10_000_000,
        },
      ],
    });

    await expect(
      cartService.findBySessionId("order-test-session"),
    ).resolves.toEqual({ items: [], totalQuantity: 0 });
  });

  it("rejects an empty Cart", async () => {
    const service = createService();

    await expect(service.createPending("empty-session")).rejects.toEqual(
      new BadRequestException("Cart is empty"),
    );
  });

  it("rejects a quote-only Product before persistence", async () => {
    const cartRepository = new InMemoryCartRepository();
    const cartService = new CartService(
      cartRepository,
      new ProductService(new StaticProductRepository()),
    );
    await cartRepository.addItem("quote-session", "nitro", 1);

    const service = new OrderService(
      new InMemoryOrderRepository(),
      cartService,
      new ProductService(new StaticProductRepository()),
    );

    await expect(service.createPending("quote-session")).rejects.toEqual(
      new UnprocessableEntityException(
        "Cart contains a Product that cannot be ordered",
      ),
    );
  });

  it("only returns an Order to its owning session", async () => {
    const repository = new InMemoryOrderRepository();
    const service = createService(repository);
    const cartService = new CartService(
      new InMemoryCartRepository(),
      new ProductService(new StaticProductRepository()),
    );
    await cartService.addItem("owner-session", "thermal-imaging", 1);

    const ownerService = new OrderService(
      repository,
      cartService,
      new ProductService(new StaticProductRepository()),
    );
    const order = await ownerService.createPending("owner-session");

    await expect(
      service.findByIdAndSessionId(order.id, "other-session"),
    ).rejects.toThrow("Order not found");
  });
});

function createService(
  repository = new InMemoryOrderRepository(),
): OrderService {
  return new OrderService(
    repository,
    new CartService(
      new InMemoryCartRepository(),
      new ProductService(new StaticProductRepository()),
    ),
    new ProductService(new StaticProductRepository()),
  );
}
