import type { CreatePendingOrderInput, OrderReadModel } from "./order.types.js";

export const ORDER_REPOSITORY = Symbol("ORDER_REPOSITORY");

export interface OrderRepository {
  createPending(input: CreatePendingOrderInput): Promise<OrderReadModel>;
  findByIdAndSessionId(
    orderId: string,
    sessionId: string,
  ): Promise<OrderReadModel | null>;
}
