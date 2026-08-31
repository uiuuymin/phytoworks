import type { InMemoryCartRepository } from "../cart/in-memory-cart.repository.js";
import type { OrderRepository } from "./order.repository.js";
import type { CreatePendingOrderInput, OrderReadModel } from "./order.types.js";

export class InMemoryOrderRepository implements OrderRepository {
  private readonly orders = new Map<
    string,
    { sessionId: string; order: OrderReadModel }
  >();
  private nextId = 1;

  constructor(private readonly cartRepository?: InMemoryCartRepository) {}

  async createPending(input: CreatePendingOrderInput): Promise<OrderReadModel> {
    const id = `order-test-${this.nextId++}`;
    const order: OrderReadModel = {
      id,
      status: "PENDING",
      currency: input.currency,
      pricingSource: input.pricingSource,
      totalAmount: input.totalAmount,
      items: input.items.map((item) => ({
        ...item,
        lineAmount: item.unitAmount * item.quantity,
      })),
    };

    this.orders.set(id, { sessionId: input.sessionId, order });
    await this.cartRepository?.clear(input.sessionId);
    return order;
  }

  async findByIdAndSessionId(
    orderId: string,
    sessionId: string,
  ): Promise<OrderReadModel | null> {
    const stored = this.orders.get(orderId);
    return stored?.sessionId === sessionId ? stored.order : null;
  }
}
