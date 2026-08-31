import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Prisma7Service } from "../prisma7/prisma7.service.js";
import { PrismaCartRepository } from "./prisma-cart.repository.js";

describe("PrismaCartRepository integration", () => {
  let prisma: Prisma7Service;
  let repository: PrismaCartRepository;
  const sessionId = `cart-api-test-${Date.now()}`;

  beforeAll(async () => {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL is required for CartRepository integration tests.",
      );
    }

    prisma = new Prisma7Service();
    repository = new PrismaCartRepository(prisma);
    await prisma.client.cart.deleteMany({ where: { sessionId } });
  });

  afterAll(async () => {
    await prisma?.client.cart.deleteMany({ where: { sessionId } });
    await prisma?.onModuleDestroy();
  });

  it("creates a Cart, merges an item and reads it back", async () => {
    await expect(repository.findBySessionId(sessionId)).resolves.toBeNull();
    await repository.addItem(sessionId, "thermal-imaging", 1);
    await expect(
      repository.addItem(sessionId, "thermal-imaging", 2),
    ).resolves.toEqual({
      items: [{ productId: "thermal-imaging", quantity: 3 }],
      totalQuantity: 3,
    });
  });

  it("updates and removes an item without affecting another session", async () => {
    const otherSession = `${sessionId}-other`;

    try {
      await repository.addItem(otherSession, "chlorophyll-fluorescence", 2);
      await expect(
        repository.setItemQuantity(sessionId, "thermal-imaging", 4),
      ).resolves.toMatchObject({ totalQuantity: 4 });
      await expect(repository.findBySessionId(otherSession)).resolves.toEqual({
        items: [{ productId: "chlorophyll-fluorescence", quantity: 2 }],
        totalQuantity: 2,
      });
      await expect(
        repository.removeItem(sessionId, "thermal-imaging"),
      ).resolves.toEqual({ items: [], totalQuantity: 0 });
    } finally {
      await prisma.client.cart.deleteMany({
        where: { sessionId: otherSession },
      });
    }
  });
});
