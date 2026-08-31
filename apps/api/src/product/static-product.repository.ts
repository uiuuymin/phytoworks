import { Injectable } from "@nestjs/common";
import { productFixtures } from "./product.data.js";
import type { ProductRepository } from "./product.repository.js";
import type { ProductBaseReadModel } from "./product.types.js";

@Injectable()
export class StaticProductRepository implements ProductRepository {
  async findAll(): Promise<readonly ProductBaseReadModel[]> {
    return productFixtures;
  }

  async findById(productId: string): Promise<ProductBaseReadModel | null> {
    return productFixtures.find((product) => product.id === productId) ?? null;
  }
}
