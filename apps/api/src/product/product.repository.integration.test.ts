import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Prisma7Service } from "../prisma7/prisma7.service.js";
import { PrismaProductRepository } from "./prisma-product.repository.js";

describe("PrismaProductRepository integration", () => {
  let prisma: Prisma7Service;
  let repository: PrismaProductRepository;

  beforeAll(() => {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL is required for ProductRepository integration tests.",
      );
    }

    prisma = new Prisma7Service();
    repository = new PrismaProductRepository(prisma);
  });

  afterAll(async () => {
    await prisma?.onModuleDestroy();
  });

  it("reads the seeded Product list from PostgreSQL", async () => {
    await expect(repository.findAll()).resolves.toMatchObject([
      { id: "chlorophyll-fluorescence", purchaseMode: "DIRECT_PURCHASE" },
      { id: "nitro", purchaseMode: "QUOTE_REQUIRED" },
      { id: "thermal-imaging", purchaseMode: "DIRECT_PURCHASE" },
    ]);
  });

  it("reads a Product detail and returns null for an unknown ID", async () => {
    await expect(repository.findById("nitro")).resolves.toMatchObject({
      id: "nitro",
      purchaseMode: "QUOTE_REQUIRED",
    });
    await expect(repository.findById("unknown-product")).resolves.toBeNull();
  });
});
