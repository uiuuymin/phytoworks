import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, it } from "vitest";
import { AppModule } from "../src/app.module.js";
import { PRODUCT_REPOSITORY } from "../src/product/product.repository.js";
import { StaticProductRepository } from "../src/product/static-product.repository.js";

describe("Health endpoint", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PRODUCT_REPOSITORY)
      .useValue(new StaticProductRepository())
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("responds to GET /health", async () => {
    await request(app.getHttpServer())
      .get("/health")
      .expect("Content-Type", /json/)
      .expect(200)
      .expect({ status: "ok" });
  });

  it("returns 404 for an unknown route", async () => {
    await request(app.getHttpServer()).get("/unknown").expect(404);
  });
});
