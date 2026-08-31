import type { ProductBaseReadModel } from "./product.types.js";

export const PRODUCT_REPOSITORY = Symbol("PRODUCT_REPOSITORY");

export interface ProductRepository {
  findAll(): Promise<readonly ProductBaseReadModel[]>;
  findById(productId: string): Promise<ProductBaseReadModel | null>;
}
