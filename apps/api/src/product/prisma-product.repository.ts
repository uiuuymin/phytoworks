import { Injectable } from "@nestjs/common";
import type { Product } from "../generated/prisma/client.js";
// biome-ignore lint/style/useImportType: NestJS needs the runtime class for dependency injection.
import { Prisma7Service } from "../prisma7/prisma7.service.js";
import type { ProductRepository } from "./product.repository.js";
import type { ProductBaseReadModel } from "./product.types.js";

@Injectable()
export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: Prisma7Service) {}

  async findAll(): Promise<readonly ProductBaseReadModel[]> {
    const products = await this.prisma.client.product.findMany({
      orderBy: { id: "asc" },
    });

    return products.map(toProductReadModel);
  }

  async findById(productId: string): Promise<ProductBaseReadModel | null> {
    const product = await this.prisma.client.product.findUnique({
      where: { id: productId },
    });

    return product ? toProductReadModel(product) : null;
  }
}

function toProductReadModel(product: Product): ProductBaseReadModel {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    description: product.description,
    summary: product.summary,
    features: product.features,
    mediaLabel: product.mediaLabel,
    purchaseMode: product.purchaseMode,
  };
}
