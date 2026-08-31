import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { AppModule } from "../src/app.module.js";
import { InMemoryPaymentRepository } from "../src/payment/in-memory-payment.repository.js";
import {
  PAYMENT_GATEWAY,
  type PaymentGateway,
} from "../src/payment/payment.gateway.js";
import { PAYMENT_REPOSITORY } from "../src/payment/payment.repository.js";

describe("Payment endpoints", () => {
  let app: INestApplication;
  const sessionId = "payment-http-session";
  const repository = new InMemoryPaymentRepository();
  const gateway: PaymentGateway & { confirm: ReturnType<typeof vi.fn> } = {
    confirm: vi.fn().mockResolvedValue({
      paymentKey: "payment-key-http",
      orderId: "order-http-payment",
      totalAmount: 5_000_000,
      status: "DONE",
    }),
  };

  beforeAll(async () => {
    repository.seedOrder({
      orderId: "order-http-payment",
      sessionId,
      status: "PENDING",
      totalAmount: 5_000_000,
      currency: "KRW",
    });
    repository.seedOrder({
      orderId: "order-http-amount",
      sessionId,
      status: "PENDING",
      totalAmount: 5_000_000,
      currency: "KRW",
    });

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PAYMENT_REPOSITORY)
      .useValue(repository)
      .overrideProvider(PAYMENT_GATEWAY)
      .useValue(gateway)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("confirms a payment and is idempotent for the same request", async () => {
    const agent = request(app.getHttpServer());
    const headers = { "x-cart-session-id": sessionId };
    const body = {
      paymentKey: "payment-key-http",
      orderId: "order-http-payment",
      amount: 5_000_000,
    };

    const first = await agent
      .post("/api/payments/confirm")
      .set(headers)
      .send(body)
      .expect(200);
    const second = await agent
      .post("/api/payments/confirm")
      .set(headers)
      .send(body)
      .expect(200);

    expect(first.body).toMatchObject({
      orderId: "order-http-payment",
      paymentKey: "payment-key-http",
      status: "DONE",
      amount: 5_000_000,
    });
    expect(second.body).toEqual(first.body);
    expect(gateway.confirm).toHaveBeenCalledTimes(1);
  });

  it("validates session and amount before approval", async () => {
    const agent = request(app.getHttpServer());
    const body = {
      paymentKey: "payment-key-invalid",
      orderId: "order-http-amount",
      amount: 1,
    };

    await agent.post("/api/payments/confirm").send(body).expect(400);
    await agent
      .post("/api/payments/confirm")
      .set("x-cart-session-id", sessionId)
      .send(body)
      .expect(400);
  });
});
