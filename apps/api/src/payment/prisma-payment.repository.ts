import { Injectable } from "@nestjs/common";
import type { Payment } from "../generated/prisma/client.js";
// biome-ignore lint/style/useImportType: NestJS needs the runtime class for dependency injection.
import { Prisma7Service } from "../prisma7/prisma7.service.js";
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
export class PrismaPaymentRepository implements PaymentRepository {
  constructor(private readonly prisma: Prisma7Service) {}

  async findOrderContext(
    orderId: string,
    sessionId: string,
  ): Promise<PaymentOrderContext | null> {
    const order = await this.prisma.client.order.findFirst({
      where: { id: orderId, sessionId },
      select: {
        id: true,
        sessionId: true,
        status: true,
        totalAmount: true,
        currency: true,
      },
    });

    return order
      ? {
          orderId: order.id,
          sessionId: order.sessionId,
          status: order.status,
          totalAmount: order.totalAmount,
          currency: order.currency as "KRW",
        }
      : null;
  }

  async findByOrderIdAndSessionId(
    orderId: string,
    sessionId: string,
  ): Promise<PaymentReadModel | null> {
    const payment = await this.prisma.client.payment.findFirst({
      where: { orderId, order: { sessionId } },
    });

    return payment ? toPaymentReadModel(payment) : null;
  }

  async prepare(input: PreparePaymentInput): Promise<PaymentReadModel> {
    return this.prisma.client.$transaction(async (transaction) => {
      const order = await transaction.order.findFirst({
        where: { id: input.orderId, sessionId: input.sessionId },
        include: { payment: true },
      });

      if (!order) {
        throw new Error("Order not found.");
      }

      if (order.payment?.status === "PENDING") {
        throw new PaymentInProgressError();
      }

      if (order.payment?.status === "DONE") {
        return toPaymentReadModel(order.payment);
      }

      const payment = order.payment
        ? await transaction.payment.update({
            where: { id: order.payment.id },
            data: {
              paymentKey: input.paymentKey,
              status: "PENDING",
              amount: input.amount,
              currency: input.currency,
              failureCode: null,
              approvedAt: null,
            },
          })
        : await transaction.payment.create({
            data: {
              orderId: input.orderId,
              paymentKey: input.paymentKey,
              status: "PENDING",
              amount: input.amount,
              currency: input.currency,
            },
          });

      return toPaymentReadModel(payment);
    });
  }

  async markDone(
    orderId: string,
    sessionId: string,
    paymentKey: string,
  ): Promise<PaymentReadModel> {
    return this.prisma.client.$transaction(async (transaction) => {
      const payment = await transaction.payment.findUnique({
        where: { orderId },
        include: { order: true },
      });

      assertPaymentOwnership(payment, sessionId, paymentKey);

      if (payment.status === "DONE") {
        return toPaymentReadModel(payment);
      }

      const updated = await transaction.payment.update({
        where: { id: payment.id },
        data: {
          status: "DONE",
          failureCode: null,
          approvedAt: new Date(),
        },
      });

      await transaction.order.update({
        where: { id: orderId },
        data: { status: "PAID" },
      });

      return toPaymentReadModel(updated);
    });
  }

  async markFailed(
    orderId: string,
    sessionId: string,
    paymentKey: string,
    failureCode: string,
  ): Promise<PaymentReadModel> {
    const payment = await this.prisma.client.payment.findUnique({
      where: { orderId },
      include: { order: true },
    });

    assertPaymentOwnership(payment, sessionId, paymentKey);

    if (payment.status === "DONE") {
      return toPaymentReadModel(payment);
    }

    const updated = await this.prisma.client.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED", failureCode },
    });

    return toPaymentReadModel(updated);
  }
}

function assertPaymentOwnership(
  payment: (Payment & { order: { sessionId: string } }) | null,
  sessionId: string,
  paymentKey: string,
): asserts payment is Payment & { order: { sessionId: string } } {
  if (
    !payment ||
    payment.order.sessionId !== sessionId ||
    payment.paymentKey !== paymentKey
  ) {
    throw new Error("Payment ownership is invalid.");
  }
}

function toPaymentReadModel(payment: Payment): PaymentReadModel {
  return {
    id: payment.id,
    orderId: payment.orderId,
    paymentKey: payment.paymentKey,
    status: payment.status,
    amount: payment.amount,
    currency: payment.currency as "KRW",
    failureCode: payment.failureCode,
    approvedAt: payment.approvedAt?.toISOString() ?? null,
  };
}
