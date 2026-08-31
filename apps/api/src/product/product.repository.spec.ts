import { describe, expect, it, vi } from "vitest";
import type { PrismaClient, Product } from "../generated/prisma/client.js";
import type { Prisma7Service } from "../prisma7/prisma7.service.js";
import { PrismaProductRepository } from "./prisma-product.repository.js";
import { StaticProductRepository } from "./static-product.repository.js";

const prismaProduct: Product = {
  id: "thermal-imaging",
  name: "Thermal Imaging Module",
  category: "이미징 모듈",
  description:
    "적외선 열화상으로 식물의 온도 변화와 스트레스 패턴을 관찰합니다.",
  summary:
    "식물에서 나타나는 온도 차이를 열화상 데이터로 확인하여 생육 반응과 스트레스 변화를 비교할 수 있습니다.",
  features: ["온도 변화를 시각화합니다."],
  mediaLabel: "THERMAL",
  purchaseMode: "DIRECT_PURCHASE",
};

describe("StaticProductRepository", () => {
  it("returns the existing fixture data", async () => {
    const repository = new StaticProductRepository();

    await expect(repository.findById("nitro")).resolves.toMatchObject({
      id: "nitro",
      purchaseMode: "QUOTE_REQUIRED",
    });
  });
});

describe("PrismaProductRepository", () => {
  it("maps Prisma rows to the API read model", async () => {
    const findMany = vi.fn().mockResolvedValue([prismaProduct]);
    const findUnique = vi.fn().mockResolvedValue(prismaProduct);
    const client = {
      product: { findMany, findUnique },
    } as unknown as PrismaClient;
    const prisma = { client } as Prisma7Service;
    const repository = new PrismaProductRepository(prisma);

    await expect(repository.findAll()).resolves.toEqual([prismaProduct]);
    await expect(repository.findById(prismaProduct.id)).resolves.toEqual(
      prismaProduct,
    );
    expect(findMany).toHaveBeenCalledWith({ orderBy: { id: "asc" } });
    expect(findUnique).toHaveBeenCalledWith({
      where: { id: prismaProduct.id },
    });
  });

  it("returns null when Prisma does not find a Product", async () => {
    const client = {
      product: {
        findMany: vi.fn(),
        findUnique: vi.fn().mockResolvedValue(null),
      },
    } as unknown as PrismaClient;
    const repository = new PrismaProductRepository({
      client,
    } as Prisma7Service);

    await expect(repository.findById("unknown-product")).resolves.toBeNull();
  });
});
