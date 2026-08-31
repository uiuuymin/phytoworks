import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaCartRepository } from "../cart/prisma-cart.repository.js";
import { PrismaOrderRepository } from "../order/prisma-order.repository.js";
import { Prisma7Service } from "../prisma7/prisma7.service.js";
import { PrismaPaymentRepository } from "./prisma-payment.repository.js";

describe("PrismaPaymentRepository integration", () => {
  let prisma: Prisma7Service;
  let repository: PrismaPaymentRepository;
  const sessionId = `payment-api-test-${Date.now()}`;
  let orderId: string;

  beforeAll(async () => {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL is required for PaymentRepository integration tests.",
      );
    }

    prisma = new Prisma7Service();
    repository = new PrismaPaymentRepository(prisma);
    const existingOrders = await prisma.client.order.findMany({
      where: { sessionId },
      select: { id: true },
    });
    if (existingOrders.length > 0) {
      await prisma.client.payment.deleteMany({
        where: { orderId: { in: existingOrders.map((order) => order.id) } },
      });
    }
    await prisma.client.order.deleteMany({ where: { sessionId } });
    await prisma.client.cart.deleteMany({ where: { sessionId } });

    const cartRepository = new PrismaCartRepository(prisma);
    await cartRepository.addItem(sessionId, "thermal-imaging", 1);
    const orderRepository = new PrismaOrderRepository(prisma);
    const order = await orderRepository.createPending({
      sessionId,
      currency: "KRW",
      pricingSource: "DEMO",
      totalAmount: 5_000_000,
      items: [
        {
          productId: "thermal-imaging",
          productName: "Thermal Imaging Module",
          unitAmount: 5_000_000,
          quantity: 1,
        },
      ],
    });
    orderId = order.id;
  });

  afterAll(async () => {
    if (orderId) {
      await prisma?.client.payment.deleteMany({ where: { orderId } });
    }
    await prisma?.client.order.deleteMany({ where: { sessionId } });
    await prisma?.client.cart.deleteMany({ where: { sessionId } });
    await prisma?.onModuleDestroy();
  });

  it("stores payment approval and changes the Order atomically", async () => {
    await expect(
      repository.findOrderContext(orderId, sessionId),
    ).resolves.toMatchObject({ status: "PENDING", totalAmount: 5_000_000 });

    await expect(
      repository.prepare({
        sessionId,
        paymentKey: "payment-key-integration",
        orderId,
        amount: 5_000_000,
        currency: "KRW",
      }),
    ).resolves.toMatchObject({ status: "PENDING", amount: 5_000_000 });

    await expect(
      repository.markDone(orderId, sessionId, "payment-key-integration"),
    ).resolves.toMatchObject({ status: "DONE" });

    await expect(
      repository.findByOrderIdAndSessionId(orderId, sessionId),
    ).resolves.toMatchObject({ status: "DONE" });
    await expect(
      repository.findOrderContext(orderId, sessionId),
    ).resolves.toMatchObject({ status: "PAID" });
  });

  it("does not expose a payment to another session", async () => {
    await expect(
      repository.findByOrderIdAndSessionId(orderId, "other-session"),
    ).resolves.toBeNull();
  });
});
