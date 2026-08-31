import { Injectable, NotFoundException } from "@nestjs/common";
import { productFixtures } from "./product.data.js";
import type { ProductReadModel } from "./product.types.js";

@Injectable()
export class ProductService {
  findAll(): readonly ProductReadModel[] {
    return productFixtures;
  }

  findById(productId: string): ProductReadModel {
    const product = productFixtures.find(
      (candidate) => candidate.id === productId,
    );

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    return product;
  }
}
