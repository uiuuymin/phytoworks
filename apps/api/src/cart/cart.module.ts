import { Module } from "@nestjs/common";
import { Prisma7Module } from "../prisma7/prisma7.module.js";
import { ProductModule } from "../product/product.module.js";
import { CartController } from "./cart.controller.js";
import { CART_REPOSITORY } from "./cart.repository.js";
import { CartService } from "./cart.service.js";
import { PrismaCartRepository } from "./prisma-cart.repository.js";

@Module({
  imports: [Prisma7Module, ProductModule],
  controllers: [CartController],
  providers: [
    CartService,
    PrismaCartRepository,
    {
      provide: CART_REPOSITORY,
      useExisting: PrismaCartRepository,
    },
  ],
  exports: [CartService],
})
export class CartModule {}
