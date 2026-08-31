import { Module } from "@nestjs/common";
import { CartModule } from "../cart/cart.module.js";
import { Prisma7Module } from "../prisma7/prisma7.module.js";
import { ProductModule } from "../product/product.module.js";
import { InMemoryOrderRepository } from "./in-memory-order.repository.js";
import { OrderController } from "./order.controller.js";
import { ORDER_REPOSITORY } from "./order.repository.js";
import { OrderService } from "./order.service.js";
import { PrismaOrderRepository } from "./prisma-order.repository.js";

@Module({
  imports: [Prisma7Module, CartModule, ProductModule],
  controllers: [OrderController],
  providers: [
    OrderService,
    InMemoryOrderRepository,
    PrismaOrderRepository,
    {
      provide: ORDER_REPOSITORY,
      useExisting: PrismaOrderRepository,
    },
  ],
  exports: [OrderService],
})
export class OrderModule {}
