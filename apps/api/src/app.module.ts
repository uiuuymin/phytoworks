import { Module } from "@nestjs/common";
import { HealthModule } from "./health/health.module.js";
import { ProductModule } from "./product/product.module.js";

@Module({
  imports: [HealthModule, ProductModule],
})
export class AppModule {}
