import { Injectable } from "@nestjs/common";
import { productFixtures } from "./product.data.js";
import type { ProductRepository } from "./product.repository.js";
import type { ProductReadModel } from "./product.types.js";

@Injectable()
export class StaticProductRepository implements ProductRepository {
  async findAll(): Promise<readonly ProductReadModel[]> {
    return productFixtures;
  }

  async findById(productId: string): Promise<ProductReadModel | null> {
    return productFixtures.find((product) => product.id === productId) ?? null;
  }
}
