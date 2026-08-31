import type {
  PaymentOrderContext,
  PaymentReadModel,
  PreparePaymentInput,
} from "./payment.types.js";

export const PAYMENT_REPOSITORY = Symbol("PAYMENT_REPOSITORY");

export interface PaymentRepository {
  findOrderContext(
    orderId: string,
    sessionId: string,
  ): Promise<PaymentOrderContext | null>;
  findByOrderIdAndSessionId(
    orderId: string,
    sessionId: string,
  ): Promise<PaymentReadModel | null>;
  prepare(input: PreparePaymentInput): Promise<PaymentReadModel>;
  markDone(
    orderId: string,
    sessionId: string,
    paymentKey: string,
  ): Promise<PaymentReadModel>;
  markFailed(
    orderId: string,
    sessionId: string,
    paymentKey: string,
    failureCode: string,
  ): Promise<PaymentReadModel>;
}

export class PaymentInProgressError extends Error {
  constructor() {
    super("Payment approval is already in progress.");
  }
}
