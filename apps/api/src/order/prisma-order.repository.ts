import { Injectable } from "@nestjs/common";
import type { Order, OrderItem } from "../generated/prisma/client.js";
// biome-ignore lint/style/useImportType: NestJS needs the runtime class for dependency injection.
import { Prisma7Service } from "../prisma7/prisma7.service.js";
import type { OrderRepository } from "./order.repository.js";
import type { CreatePendingOrderInput, OrderReadModel } from "./order.types.js";

@Injectable()
export class PrismaOrderRepository implements OrderRepository {
  constructor(private readonly prisma: Prisma7Service) {}

  async createPending(input: CreatePendingOrderInput): Promise<OrderReadModel> {
    return this.prisma.client.$transaction(async (transaction) => {
      const cart = await transaction.cart.findUnique({
        where: { sessionId: input.sessionId },
        include: { items: { orderBy: { productId: "asc" } } },
      });

      if (!cart) {
        throw new Error("Cart disappeared before Order creation.");
      }

      const expectedItems = [...input.items]
        .sort((left, right) => left.productId.localeCompare(right.productId))
        .map(({ productId, quantity }) => ({ productId, quantity }));
      const actualItems = cart.items.map(({ productId, quantity }) => ({
        productId,
        quantity,
      }));

      if (JSON.stringify(expectedItems) !== JSON.stringify(actualItems)) {
        throw new Error("Cart changed before Order creation.");
      }

      const order = await transaction.order.create({
        data: {
          sessionId: input.sessionId,
          status: "PENDING",
          currency: input.currency,
          pricingSource: input.pricingSource,
          totalAmount: input.totalAmount,
          items: {
            create: input.items.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              unitAmount: item.unitAmount,
              quantity: item.quantity,
            })),
          },
        },
        include: { items: { orderBy: { id: "asc" } } },
      });

      await transaction.cartItem.deleteMany({ where: { cartId: cart.id } });

      return toOrderReadModel(order, order.items);
    });
  }

  async findByIdAndSessionId(
    orderId: string,
    sessionId: string,
  ): Promise<OrderReadModel | null> {
    const order = await this.prisma.client.order.findFirst({
      where: { id: orderId, sessionId },
      include: { items: { orderBy: { id: "asc" } } },
    });

    return order ? toOrderReadModel(order, order.items) : null;
  }
}

function toOrderReadModel(
  order: Order,
  items: readonly OrderItem[],
): OrderReadModel {
  if (items.some((item) => item.orderId !== order.id)) {
    throw new Error("Order item relation is invalid.");
  }

  const mappedItems = items.map((item) => ({
    productId: item.productId,
    productName: item.productName,
    unitAmount: item.unitAmount,
    quantity: item.quantity,
    lineAmount: item.unitAmount * item.quantity,
  }));

  return {
    id: order.id,
    status: order.status,
    currency: order.currency as "KRW",
    pricingSource: order.pricingSource,
    totalAmount: order.totalAmount,
    items: mappedItems,
  };
}
