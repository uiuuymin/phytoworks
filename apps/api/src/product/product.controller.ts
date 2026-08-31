import { Controller, Get, Param } from "@nestjs/common";
// biome-ignore lint/style/useImportType: NestJS needs the runtime class for dependency injection.
import { ProductService } from "./product.service.js";
import type { ProductListResponse, ProductReadModel } from "./product.types.js";

@Controller("api/products")
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  getProducts(): ProductListResponse {
    return { items: this.productService.findAll() };
  }

  @Get(":productId")
  getProduct(@Param("productId") productId: string): ProductReadModel {
    return this.productService.findById(productId);
  }
}
