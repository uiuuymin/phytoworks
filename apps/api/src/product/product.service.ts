import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { toProductReadModel } from "./product.catalog.js";
import {
  PRODUCT_REPOSITORY,
  type ProductRepository,
} from "./product.repository.js";
import type {
  ProductBaseReadModel,
  ProductReadModel,
} from "./product.types.js";

@Injectable()
export class ProductService {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
  ) {}

  async findAll(): Promise<readonly ProductReadModel[]> {
    try {
      const products = await this.productRepository.findAll();
      return products.map(toProductReadModel);
    } catch {
      throw new InternalServerErrorException("Product data unavailable");
    }
  }

  async findById(productId: string): Promise<ProductReadModel> {
    let product: ProductBaseReadModel | null;

    try {
      product = await this.productRepository.findById(productId);
    } catch {
      throw new InternalServerErrorException("Product data unavailable");
    }

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    try {
      return toProductReadModel(product);
    } catch {
      throw new InternalServerErrorException("Product data unavailable");
    }
  }
}
