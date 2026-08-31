import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppModule } from "../src/app.module.js";
import { PRODUCT_REPOSITORY } from "../src/product/product.repository.js";
import { StaticProductRepository } from "../src/product/static-product.repository.js";

describe("Product endpoints", () => {
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

  it("responds to GET /api/products", async () => {
    await request(app.getHttpServer())
      .get("/api/products")
      .expect("Content-Type", /json/)
      .expect(200)
      .expect(({ body }) => {
        expect(body.items).toHaveLength(3);
        expect(body.items[0]).toMatchObject({
          id: "nitro",
          summary: expect.any(String),
          features: expect.any(Array),
          purchaseMode: "QUOTE_REQUIRED",
          pricing: {
            mode: "QUOTE_REFERENCE",
            authoritative: false,
          },
        });
      });
  });

  it("responds to GET /api/products/:productId", async () => {
    await request(app.getHttpServer())
      .get("/api/products/thermal-imaging")
      .expect("Content-Type", /json/)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          id: "thermal-imaging",
          name: "Thermal Imaging Module",
          summary: expect.any(String),
          features: expect.any(Array),
          purchaseMode: "DIRECT_PURCHASE",
          pricing: {
            mode: "DEMO",
            amount: 5_000_000,
            authoritative: false,
          },
        });
      });
  });

  it("returns NITRO brochure option groups without option prices", async () => {
    await request(app.getHttpServer())
      .get("/api/products/nitro")
      .expect(200)
      .expect(({ body }) => {
        expect(body.optionGroups).toEqual([
          {
            id: "depth-imaging",
            label: "Depth 이미징",
            selection: "single",
            source: "BROCHURE",
            options: [
              { id: "lidar", label: "Lidar" },
              { id: "stereo", label: "Stereo" },
            ],
          },
          {
            id: "irrigation",
            label: "관수",
            selection: "single",
            source: "BROCHURE",
            options: [
              { id: "drip", label: "점적 관수" },
              { id: "mist", label: "분무경" },
              { id: "sub-irrigation", label: "저면 관수" },
            ],
          },
          {
            id: "add-ons",
            label: "추가 옵션",
            selection: "multiple",
            source: "BROCHURE",
            options: [
              { id: "ec-ph-sensor", label: "EC/pH 센서" },
              { id: "load-cell-sensor", label: "로드셀 센서" },
              { id: "power-meter", label: "전력량계" },
              { id: "humidifier", label: "가습 장치" },
            ],
          },
        ]);
        expect(JSON.stringify(body)).not.toContain("stockQuantity");
        expect(JSON.stringify(body)).not.toContain("additionalPrice");
      });
  });

  it("returns 404 for an unknown Product ID", async () => {
    await request(app.getHttpServer())
      .get("/api/products/unknown-product")
      .expect("Content-Type", /json/)
      .expect(404)
      .expect({
        statusCode: 404,
        message: "Product not found",
        error: "Not Found",
      });
  });

  it("returns 404 for invalid Product paths", async () => {
    await request(app.getHttpServer()).get("/api/product").expect(404);
    await request(app.getHttpServer())
      .get("/api/products/thermal-imaging/extra")
      .expect(404);
    await request(app.getHttpServer()).get("/products").expect(404);
  });
});
