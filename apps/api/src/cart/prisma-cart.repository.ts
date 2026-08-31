import { Injectable } from "@nestjs/common";
import type { Cart, CartItem } from "../generated/prisma/client.js";
// biome-ignore lint/style/useImportType: NestJS needs the runtime class for dependency injection.
import { Prisma7Service } from "../prisma7/prisma7.service.js";
import type { CartRepository } from "./cart.repository.js";
import type { CartReadModel } from "./cart.types.js";

@Injectable()
export class PrismaCartRepository implements CartRepository {
  constructor(private readonly prisma: Prisma7Service) {}

  async findBySessionId(sessionId: string): Promise<CartReadModel | null> {
    const cart = await this.prisma.client.cart.findUnique({
      where: { sessionId },
      include: { items: { orderBy: { productId: "asc" } } },
    });

    return cart ? toCartReadModel(cart, cart.items) : null;
  }

  async addItem(
    sessionId: string,
    productId: string,
    quantity: number,
  ): Promise<CartReadModel> {
    const cart = await this.prisma.client.cart.upsert({
      where: { sessionId },
      update: {},
      create: { sessionId },
      select: { id: true },
    });

    await this.prisma.client.$transaction(async (transaction) => {
      const item = await transaction.cartItem.findUnique({
        where: { cartId_productId: { cartId: cart.id, productId } },
      });

      if (item) {
        await transaction.cartItem.update({
          where: { id: item.id },
          data: { quantity: item.quantity + quantity },
        });
        return;
      }

      await transaction.cartItem.create({
        data: { cartId: cart.id, productId, quantity },
      });
    });

    const result = await this.findBySessionId(sessionId);

    if (!result) {
      throw new Error("Cart disappeared after adding an item.");
    }

    return result;
  }

  async setItemQuantity(
    sessionId: string,
    productId: string,
    quantity: number,
  ): Promise<CartReadModel | null> {
    const cart = await this.prisma.client.cart.findUnique({
      where: { sessionId },
      select: { id: true },
    });

    if (!cart) {
      return null;
    }

    const item = await this.prisma.client.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
      select: { id: true },
    });

    if (!item) {
      return null;
    }

    await this.prisma.client.cartItem.update({
      where: { id: item.id },
      data: { quantity },
    });

    return this.findBySessionId(sessionId);
  }

  async removeItem(
    sessionId: string,
    productId: string,
  ): Promise<CartReadModel | null> {
    const cart = await this.prisma.client.cart.findUnique({
      where: { sessionId },
      select: { id: true },
    });

    if (!cart) {
      return null;
    }

    const item = await this.prisma.client.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
      select: { id: true },
    });

    if (!item) {
      return null;
    }

    await this.prisma.client.cartItem.delete({ where: { id: item.id } });

    return this.findBySessionId(sessionId);
  }
}

function toCartReadModel(
  cart: Cart,
  items: readonly CartItem[],
): CartReadModel {
  if (items.some((item) => item.cartId !== cart.id)) {
    throw new Error("Cart item relation is invalid.");
  }

  const mappedItems = items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
  }));

  return {
    items: mappedItems,
    totalQuantity: mappedItems.reduce(
      (total, item) => total + item.quantity,
      0,
    ),
  };
}
