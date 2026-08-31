import type { CartRepository } from "./cart.repository.js";
import type { CartReadModel } from "./cart.types.js";

export class InMemoryCartRepository implements CartRepository {
  private readonly carts = new Map<string, Map<string, number>>();

  async findBySessionId(sessionId: string): Promise<CartReadModel | null> {
    const items = this.carts.get(sessionId);
    return items ? toCartReadModel(items) : null;
  }

  async addItem(
    sessionId: string,
    productId: string,
    quantity: number,
  ): Promise<CartReadModel> {
    const items = this.carts.get(sessionId) ?? new Map<string, number>();
    items.set(productId, (items.get(productId) ?? 0) + quantity);
    this.carts.set(sessionId, items);
    return toCartReadModel(items);
  }

  async setItemQuantity(
    sessionId: string,
    productId: string,
    quantity: number,
  ): Promise<CartReadModel | null> {
    const items = this.carts.get(sessionId);

    if (!items?.has(productId)) {
      return null;
    }

    items.set(productId, quantity);
    return toCartReadModel(items);
  }

  async removeItem(
    sessionId: string,
    productId: string,
  ): Promise<CartReadModel | null> {
    const items = this.carts.get(sessionId);

    if (!items?.has(productId)) {
      return null;
    }

    items.delete(productId);
    return toCartReadModel(items);
  }
}

function toCartReadModel(items: ReadonlyMap<string, number>): CartReadModel {
  const mappedItems = [...items.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([productId, quantity]) => ({ productId, quantity }));

  return {
    items: mappedItems,
    totalQuantity: mappedItems.reduce(
      (total, item) => total + item.quantity,
      0,
    ),
  };
}
