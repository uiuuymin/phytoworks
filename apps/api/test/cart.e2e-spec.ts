import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, it } from "vitest";
import { AppModule } from "../src/app.module.js";
import { CART_REPOSITORY } from "../src/cart/cart.repository.js";
import { InMemoryCartRepository } from "../src/cart/in-memory-cart.repository.js";
import { PRODUCT_REPOSITORY } from "../src/product/product.repository.js";
import { StaticProductRepository } from "../src/product/static-product.repository.js";

describe("Cart endpoints", () => {
  let app: INestApplication;
  const sessionId = "http-test-session";

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PRODUCT_REPOSITORY)
      .useValue(new StaticProductRepository())
      .overrideProvider(CART_REPOSITORY)
      .useValue(new InMemoryCartRepository())
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("supports Cart read, add, merge, update and remove", async () => {
    const agent = request(app.getHttpServer());
    const headers = { "x-cart-session-id": sessionId };

    await agent.get("/api/cart").set(headers).expect(200).expect({
      items: [],
      totalQuantity: 0,
    });

    await agent
      .post("/api/cart/items")
      .set(headers)
      .send({ productId: "thermal-imaging" })
      .expect(201)
      .expect({
        items: [{ productId: "thermal-imaging", quantity: 1 }],
        totalQuantity: 1,
      });

    await agent
      .post("/api/cart/items")
      .set(headers)
      .send({ productId: "thermal-imaging", quantity: 2 })
      .expect(201)
      .expect({
        items: [{ productId: "thermal-imaging", quantity: 3 }],
        totalQuantity: 3,
      });

    await agent
      .patch("/api/cart/items/thermal-imaging")
      .set(headers)
      .send({ quantity: 4 })
      .expect(200)
      .expect({
        items: [{ productId: "thermal-imaging", quantity: 4 }],
        totalQuantity: 4,
      });

    await agent
      .delete("/api/cart/items/thermal-imaging")
      .set(headers)
      .expect(200)
      .expect({ items: [], totalQuantity: 0 });
  });

  it("rejects invalid ownership and Product choices", async () => {
    const agent = request(app.getHttpServer());

    await agent.get("/api/cart").expect(400);
    await agent
      .post("/api/cart/items")
      .set("x-cart-session-id", sessionId)
      .send({ productId: "nitro" })
      .expect(422);
    await agent
      .post("/api/cart/items")
      .set("x-cart-session-id", sessionId)
      .send({ productId: "unknown-product" })
      .expect(404);
    await agent
      .post("/api/cart/items")
      .set("x-cart-session-id", sessionId)
      .send({ productId: "thermal-imaging", quantity: 0 })
      .expect(400);
  });

  it("keeps Health and unknown route behavior", async () => {
    await request(app.getHttpServer())
      .get("/health")
      .expect(200)
      .expect({ status: "ok" });
    await request(app.getHttpServer())
      .get("/api/cart/unknown/path")
      .expect(404);
  });
});
