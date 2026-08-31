import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaCartRepository } from "../cart/prisma-cart.repository.js";
import { Prisma7Service } from "../prisma7/prisma7.service.js";
import { PrismaOrderRepository } from "./prisma-order.repository.js";

describe("PrismaOrderRepository integration", () => {
  let prisma: Prisma7Service;
  let cartRepository: PrismaCartRepository;
  let repository: PrismaOrderRepository;
  const sessionId = `order-api-test-${Date.now()}`;

  beforeAll(async () => {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL is required for OrderRepository integration tests.",
      );
    }

    prisma = new Prisma7Service();
    cartRepository = new PrismaCartRepository(prisma);
    repository = new PrismaOrderRepository(prisma);
    await prisma.client.order.deleteMany({ where: { sessionId } });
    await prisma.client.cart.deleteMany({ where: { sessionId } });
    await cartRepository.addItem(sessionId, "thermal-imaging", 2);
  });

  afterAll(async () => {
    await prisma?.client.order.deleteMany({ where: { sessionId } });
    await prisma?.client.cart.deleteMany({ where: { sessionId } });
    await prisma?.onModuleDestroy();
  });

  it("creates an Order, snapshots items and clears Cart atomically", async () => {
    const order = await repository.createPending({
      sessionId,
      currency: "KRW",
      pricingSource: "DEMO",
      totalAmount: 10_000_000,
      items: [
        {
          productId: "thermal-imaging",
          productName: "Thermal Imaging Module",
          unitAmount: 5_000_000,
          quantity: 2,
        },
      ],
    });

    expect(order).toMatchObject({
      status: "PENDING",
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
    await expect(cartRepository.findBySessionId(sessionId)).resolves.toEqual({
      items: [],
      totalQuantity: 0,
    });
  });

  it("does not expose an Order to another session", async () => {
    const order = await repository.findByIdAndSessionId(
      (await prisma.client.order.findFirstOrThrow({ where: { sessionId } })).id,
      "other-session",
    );

    expect(order).toBeNull();
  });
});
