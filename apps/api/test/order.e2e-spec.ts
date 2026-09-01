import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { AppModule } from "../src/app.module.js";
import { CART_REPOSITORY } from "../src/cart/cart.repository.js";
import { createCartSessionToken } from "../src/cart/cart-session.js";
import { InMemoryCartRepository } from "../src/cart/in-memory-cart.repository.js";
import { InMemoryOrderRepository } from "../src/order/in-memory-order.repository.js";
import { ORDER_REPOSITORY } from "../src/order/order.repository.js";
import { PRODUCT_REPOSITORY } from "../src/product/product.repository.js";
import { StaticProductRepository } from "../src/product/static-product.repository.js";

describe("Order endpoints", () => {
  let app: INestApplication;
  const sessionId = "00000000-0000-4000-8000-000000000002";
  const sessionToken = createCartSessionToken(
    sessionId,
    "test-cart-session-secret-32-characters",
  );
  const otherSessionToken = createCartSessionToken(
    "00000000-0000-4000-8000-000000000003",
    "test-cart-session-secret-32-characters",
  );

  vi.stubEnv("CART_SESSION_SECRET", "test-cart-session-secret-32-characters");

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
    const headers = { "x-cart-session-token": sessionToken };

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
      .set({ "x-cart-session-token": otherSessionToken })
      .expect(404);
  });

  it("rejects missing session and empty Cart", async () => {
    const agent = request(app.getHttpServer());

    await agent.post("/api/orders").expect(400);
    await agent
      .post("/api/orders")
      .set(
        "x-cart-session-token",
        createCartSessionToken(
          "00000000-0000-4000-8000-000000000004",
          "test-cart-session-secret-32-characters",
        ),
      )
      .expect(400);
  });
});
