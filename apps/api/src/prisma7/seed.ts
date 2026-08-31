import type { PurchaseMode } from "../generated/prisma/enums.js";
import { productFixtures } from "../product/product.data.js";
import { createPrismaClient } from "./db.js";

const prisma = createPrismaClient();

try {
  for (const product of productFixtures) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {
        name: product.name,
        category: product.category,
        description: product.description,
        summary: product.summary,
        features: [...product.features],
        mediaLabel: product.mediaLabel,
        purchaseMode: product.purchaseMode as PurchaseMode,
      },
      create: {
        id: product.id,
        name: product.name,
        category: product.category,
        description: product.description,
        summary: product.summary,
        features: [...product.features],
        mediaLabel: product.mediaLabel,
        purchaseMode: product.purchaseMode as PurchaseMode,
      },
    });
  }

  console.log(`Seeded ${productFixtures.length} products.`);
} finally {
  await prisma.$disconnect();
}
