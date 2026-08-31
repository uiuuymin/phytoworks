import { Module } from "@nestjs/common";
import { CartModule } from "./cart/cart.module.js";
import { HealthModule } from "./health/health.module.js";
import { OrderModule } from "./order/order.module.js";
import { ProductModule } from "./product/product.module.js";

@Module({
  imports: [HealthModule, ProductModule, CartModule, OrderModule],
})
export class AppModule {}
