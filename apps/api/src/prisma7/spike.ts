import { PurchaseMode } from "../generated/prisma/enums.js";
import { createPrismaClient } from "./db.js";

const prisma = createPrismaClient();
const id = "prisma7-spike-product";

try {
  await prisma.product.deleteMany({ where: { id } });

  const created = await prisma.product.create({
    data: {
      id,
      name: "Prisma 7 Spike Product",
      category: "Spike",
      description: "Temporary compatibility record.",
      summary: "Temporary compatibility record.",
      features: ["create", "read", "delete"],
      mediaLabel: "Spike placeholder",
      purchaseMode: PurchaseMode.DIRECT_PURCHASE,
    },
  });
  const read = await prisma.product.findUnique({ where: { id } });

  if (
    !read ||
    read.id !== created.id ||
    read.purchaseMode !== PurchaseMode.DIRECT_PURCHASE
  ) {
    throw new Error("Prisma 7 Product create/read verification failed.");
  }

  await prisma.product.delete({ where: { id } });
  console.log(
    JSON.stringify({ created: created.id, read: read.id, deleted: true }),
  );
} finally {
  await prisma.$disconnect();
}
