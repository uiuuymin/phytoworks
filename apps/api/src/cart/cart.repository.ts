import type { CartReadModel } from "./cart.types.js";

export const CART_REPOSITORY = Symbol("CART_REPOSITORY");

export interface CartRepository {
  findBySessionId(sessionId: string): Promise<CartReadModel | null>;
  addItem(
    sessionId: string,
    productId: string,
    quantity: number,
  ): Promise<CartReadModel>;
  setItemQuantity(
    sessionId: string,
    productId: string,
    quantity: number,
  ): Promise<CartReadModel | null>;
  removeItem(
    sessionId: string,
    productId: string,
  ): Promise<CartReadModel | null>;
}
