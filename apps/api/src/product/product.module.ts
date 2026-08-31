import { Module } from "@nestjs/common";
import { Prisma7Module } from "../prisma7/prisma7.module.js";
import { PrismaProductRepository } from "./prisma-product.repository.js";
import { ProductController } from "./product.controller.js";
import { PRODUCT_REPOSITORY } from "./product.repository.js";
import { ProductService } from "./product.service.js";
import { StaticProductRepository } from "./static-product.repository.js";

@Module({
  imports: [Prisma7Module],
  controllers: [ProductController],
  providers: [
    ProductService,
    StaticProductRepository,
    PrismaProductRepository,
    {
      provide: PRODUCT_REPOSITORY,
      useExisting: PrismaProductRepository,
    },
  ],
  exports: [ProductService],
})
export class ProductModule {}
