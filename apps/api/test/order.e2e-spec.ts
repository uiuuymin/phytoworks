import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppModule } from "../src/app.module.js";
import { CART_REPOSITORY } from "../src/cart/cart.repository.js";
import { InMemoryCartRepository } from "../src/cart/in-memory-cart.repository.js";
import { InMemoryOrderRepository } from "../src/order/in-memory-order.repository.js";
import { ORDER_REPOSITORY } from "../src/order/order.repository.js";
import { PRODUCT_REPOSITORY } from "../src/product/product.repository.js";
import { StaticProductRepository } from "../src/product/static-product.repository.js";

describe("Order endpoints", () => {
  let app: INestApplication;
  const sessionId = "order-http-session";

  beforeAll(async () => {
    const cartRepository = new InMemoryCartRepository();
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PRODUCT_REPOSITORY)
      .useValue(new StaticProductRepository())
      .overrideProvider(CART_REPOSITORY)
      .useValue(cartRepository)
      .overrideProvider(ORDER_REPOSITORY)
      .useValue(new InMemoryOrderRepository(cartRepository))
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("creates and reads a pending Order from Cart", async () => {
    const agent = request(app.getHttpServer());
    const headers = { "x-cart-session-id": sessionId };

    await agent
      .post("/api/cart/items")
      .set(headers)
      .send({ productId: "thermal-imaging", quantity: 2 })
      .expect(201);

    const response = await agent.post("/api/orders").set(headers).expect(201);

    expect(response.body).toMatchObject({
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

    await agent
      .get(`/api/orders/${response.body.id}`)
      .set(headers)
      .expect(200)
      .expect(response.body);

    await agent.get("/api/cart").set(headers).expect(200).expect({
      items: [],
      totalQuantity: 0,
    });

    await agent
      .get(`/api/orders/${response.body.id}`)
      .set({ "x-cart-session-id": "other-session" })
      .expect(404);
  });

  it("rejects missing session and empty Cart", async () => {
    const agent = request(app.getHttpServer());

    await agent.post("/api/orders").expect(400);
    await agent
      .post("/api/orders")
      .set("x-cart-session-id", "empty-order-session")
      .expect(400);
  });
});
