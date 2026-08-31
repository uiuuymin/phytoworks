import type { ProductReadModel } from "./product.types.js";

export const PRODUCT_REPOSITORY = Symbol("PRODUCT_REPOSITORY");

export interface ProductRepository {
  findAll(): Promise<readonly ProductReadModel[]>;
  findById(productId: string): Promise<ProductReadModel | null>;
}
