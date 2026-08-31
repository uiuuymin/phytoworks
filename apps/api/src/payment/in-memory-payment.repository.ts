import { Injectable } from "@nestjs/common";
import {
  PaymentInProgressError,
  type PaymentRepository,
} from "./payment.repository.js";
import type {
  PaymentOrderContext,
  PaymentReadModel,
  PreparePaymentInput,
} from "./payment.types.js";

@Injectable()
export class InMemoryPaymentRepository implements PaymentRepository {
  private readonly orders = new Map<string, PaymentOrderContext>();
  private readonly payments = new Map<string, PaymentReadModel>();
  private nextId = 1;

  seedOrder(order: PaymentOrderContext): void {
    this.orders.set(order.orderId, { ...order });
  }

  async findOrderContext(
    orderId: string,
    sessionId: string,
  ): Promise<PaymentOrderContext | null> {
    const order = this.orders.get(orderId);
    return order?.sessionId === sessionId ? { ...order } : null;
  }

  async findByOrderIdAndSessionId(
    orderId: string,
    sessionId: string,
  ): Promise<PaymentReadModel | null> {
    const order = await this.findOrderContext(orderId, sessionId);
    return order ? (this.payments.get(orderId) ?? null) : null;
  }

  async prepare(input: PreparePaymentInput): Promise<PaymentReadModel> {
    const order = await this.findOrderContext(input.orderId, input.sessionId);
    if (!order) {
      throw new Error("Order not found.");
    }

    const existing = this.payments.get(input.orderId);
    if (existing?.status === "PENDING") {
      throw new PaymentInProgressError();
    }

    const payment: PaymentReadModel = {
      id: existing?.id ?? `payment-test-${this.nextId++}`,
      orderId: input.orderId,
      paymentKey: input.paymentKey,
      status: "PENDING",
      amount: input.amount,
      currency: input.currency,
      failureCode: null,
      approvedAt: null,
    };
    this.payments.set(input.orderId, payment);
    return payment;
  }

  async markDone(
    orderId: string,
    sessionId: string,
    paymentKey: string,
  ): Promise<PaymentReadModel> {
    const order = await this.findOrderContext(orderId, sessionId);
    const payment = this.payments.get(orderId);
    if (!order || !payment || payment.paymentKey !== paymentKey) {
      throw new Error("Payment not found.");
    }

    const completed = {
      ...payment,
      status: "DONE" as const,
      approvedAt: new Date().toISOString(),
    };
    this.payments.set(orderId, completed);
    this.orders.set(orderId, { ...order, status: "PAID" });
    return completed;
  }

  async markFailed(
    orderId: string,
    sessionId: string,
    paymentKey: string,
    failureCode: string,
  ): Promise<PaymentReadModel> {
    const order = await this.findOrderContext(orderId, sessionId);
    const payment = this.payments.get(orderId);
    if (!order || !payment || payment.paymentKey !== paymentKey) {
      throw new Error("Payment not found.");
    }

    const failed = {
      ...payment,
      status: "FAILED" as const,
      failureCode,
    };
    this.payments.set(orderId, failed);
    return failed;
  }
}
