import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import {
  PRODUCT_REPOSITORY,
  type ProductRepository,
} from "./product.repository.js";
import type { ProductReadModel } from "./product.types.js";

@Injectable()
export class ProductService {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
  ) {}

  findAll(): Promise<readonly ProductReadModel[]> {
    return this.productRepository.findAll();
  }

  async findById(productId: string): Promise<ProductReadModel> {
    const product = await this.productRepository.findById(productId);

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    return product;
  }
}
