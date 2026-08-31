import type { OrderStatus } from "../order/order.types.js";

export type PaymentStatus = "PENDING" | "DONE" | "FAILED";

export type PaymentReadModel = {
  id: string;
  orderId: string;
  paymentKey: string;
  status: PaymentStatus;
  amount: number;
  currency: "KRW";
  failureCode: string | null;
  approvedAt: string | null;
};

export type PaymentOrderContext = {
  orderId: string;
  sessionId: string;
  status: OrderStatus;
  totalAmount: number;
  currency: "KRW";
};

export type ConfirmPaymentInput = {
  sessionId: string;
  paymentKey: string;
  orderId: string;
  amount: number;
};

export type PreparePaymentInput = {
  sessionId: string;
  paymentKey: string;
  orderId: string;
  amount: number;
  currency: "KRW";
};

export type PaymentGatewayInput = {
  paymentKey: string;
  orderId: string;
  amount: number;
};

export type PaymentGatewayResult = {
  paymentKey: string;
  orderId: string;
  totalAmount: number;
  status: string;
};
