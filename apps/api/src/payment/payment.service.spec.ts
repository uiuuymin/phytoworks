import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";
import { InMemoryPaymentRepository } from "./in-memory-payment.repository.js";
import type { PaymentGateway } from "./payment.gateway.js";
import { PaymentService } from "./payment.service.js";

describe("PaymentService", () => {
  it("confirms a payment and changes the Order to PAID", async () => {
    const repository = createRepository();
    const gateway = createGateway();
    const service = new PaymentService(repository, gateway);

    await expect(
      service.confirm({
        sessionId: "payment-test-session",
        paymentKey: "payment-key-1",
        orderId: "order-payment-test",
        amount: 5_000_000,
      }),
    ).resolves.toMatchObject({
      orderId: "order-payment-test",
      paymentKey: "payment-key-1",
      status: "DONE",
      amount: 5_000_000,
      currency: "KRW",
      failureCode: null,
    });

    expect(gateway.confirm).toHaveBeenCalledWith({
      paymentKey: "payment-key-1",
      orderId: "order-payment-test",
      amount: 5_000_000,
    });
    await expect(
      repository.findOrderContext("order-payment-test", "payment-test-session"),
    ).resolves.toMatchObject({ status: "PAID" });
  });

  it("rejects a client amount that differs from the Order", async () => {
    const repository = createRepository();
    const gateway = createGateway();
    const service = new PaymentService(repository, gateway);

    await expect(
      service.confirm({
        sessionId: "payment-test-session",
        paymentKey: "payment-key-amount-mismatch",
        orderId: "order-payment-test",
        amount: 1,
      }),
    ).rejects.toEqual(
      new BadRequestException("Payment amount does not match Order"),
    );
    expect(gateway.confirm).not.toHaveBeenCalled();
  });

  it("records a gateway failure and leaves the Order pending", async () => {
    const repository = createRepository();
    const gateway = createGateway();
    gateway.confirm.mockRejectedValueOnce({ code: "REJECT_CARD_COMPANY" });
    const service = new PaymentService(repository, gateway);

    await expect(
      service.confirm({
        sessionId: "payment-test-session",
        paymentKey: "payment-key-failed",
        orderId: "order-payment-test",
        amount: 5_000_000,
      }),
    ).rejects.toEqual(new BadGatewayException("Payment approval failed"));

    await expect(
      repository.findByOrderIdAndSessionId(
        "order-payment-test",
        "payment-test-session",
      ),
    ).resolves.toMatchObject({
      status: "FAILED",
      failureCode: "REJECT_CARD_COMPANY",
    });
    await expect(
      repository.findOrderContext("order-payment-test", "payment-test-session"),
    ).resolves.toMatchObject({ status: "PENDING" });
  });

  it("returns the same successful result without confirming twice", async () => {
    const repository = createRepository();
    const gateway = createGateway();
    const service = new PaymentService(repository, gateway);
    const input = {
      sessionId: "payment-test-session",
      paymentKey: "payment-key-idempotent",
      orderId: "order-payment-test",
      amount: 5_000_000,
    };

    const first = await service.confirm(input);
    const second = await service.confirm(input);

    expect(second).toEqual(first);
    expect(gateway.confirm).toHaveBeenCalledTimes(1);
  });

  it("does not allow another session to confirm the Order", async () => {
    const service = new PaymentService(createRepository(), createGateway());

    await expect(
      service.confirm({
        sessionId: "other-session",
        paymentKey: "payment-key-owner",
        orderId: "order-payment-test",
        amount: 5_000_000,
      }),
    ).rejects.toThrow("Order not found");
  });

  it("rejects a second payment key after successful approval", async () => {
    const repository = createRepository();
    const service = new PaymentService(repository, createGateway());
    await service.confirm({
      sessionId: "payment-test-session",
      paymentKey: "payment-key-original",
      orderId: "order-payment-test",
      amount: 5_000_000,
    });

    await expect(
      service.confirm({
        sessionId: "payment-test-session",
        paymentKey: "payment-key-different",
        orderId: "order-payment-test",
        amount: 5_000_000,
      }),
    ).rejects.toEqual(new ConflictException("Order has already been paid"));
  });
});

function createRepository(): InMemoryPaymentRepository {
  const repository = new InMemoryPaymentRepository();
  repository.seedOrder({
    orderId: "order-payment-test",
    sessionId: "payment-test-session",
    status: "PENDING",
    totalAmount: 5_000_000,
    currency: "KRW",
  });
  return repository;
}

function createGateway(): PaymentGateway & {
  confirm: ReturnType<typeof vi.fn>;
} {
  return {
    confirm: vi.fn().mockImplementation((input) =>
      Promise.resolve({
        paymentKey: input.paymentKey,
        orderId: input.orderId,
        totalAmount: input.amount,
        status: "DONE",
      }),
    ),
  };
}
